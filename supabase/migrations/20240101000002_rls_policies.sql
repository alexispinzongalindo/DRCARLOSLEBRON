-- Row Level Security Policies

-- Helper function to get user role from JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'role')::user_role,
    'therapist'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user staff ID
CREATE OR REPLACE FUNCTION get_user_staff_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM staff 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Facilities policies
CREATE POLICY "Users can view facilities" ON facilities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage facilities" ON facilities
  FOR ALL USING (get_user_role() = 'admin');

-- Staff policies
CREATE POLICY "Users can view staff" ON staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage staff" ON staff
  FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Staff can update own record" ON staff
  FOR UPDATE USING (user_id = auth.uid());

-- Insurance plans policies
CREATE POLICY "Users can view insurance plans" ON insurance_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and billing can manage insurance plans" ON insurance_plans
  FOR ALL USING (get_user_role() IN ('admin', 'billing'));

-- Patients policies
CREATE POLICY "Therapists and front desk can view patients" ON patients
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk', 'billing')
  );

CREATE POLICY "Therapists and front desk can create patients" ON patients
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists and front desk can update patients" ON patients
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Admin can delete patients" ON patients
  FOR DELETE USING (get_user_role() = 'admin');

-- Patient insurance policies
CREATE POLICY "Users can view patient insurance" ON patient_insurance
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk', 'billing')
  );

CREATE POLICY "Users can manage patient insurance" ON patient_insurance
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk', 'billing')
  );

-- Encounters policies
CREATE POLICY "Therapists can view encounters" ON encounters
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can create encounters" ON encounters
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    seen_by = get_user_staff_id()
  );

CREATE POLICY "Therapists can update own encounters" ON encounters
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    (seen_by = get_user_staff_id() OR get_user_role() = 'admin')
  );

-- ICD-10 and CPT codes policies (reference data - read only for most users)
CREATE POLICY "Users can view ICD-10 codes" ON icd10_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage ICD-10 codes" ON icd10_codes
  FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Users can view CPT codes" ON cpt_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage CPT codes" ON cpt_codes
  FOR ALL USING (get_user_role() = 'admin');

-- Diagnoses policies
CREATE POLICY "Therapists can view diagnoses" ON diagnoses
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage diagnoses" ON diagnoses
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- SOAP notes policies
CREATE POLICY "Therapists can view SOAP notes" ON soap_notes
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage SOAP notes" ON soap_notes
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Objective findings policies
CREATE POLICY "Therapists can view objective findings" ON objective_findings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage objective findings" ON objective_findings
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Outcome measures policies (reference data)
CREATE POLICY "Users can view outcome measures" ON outcome_measures
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage outcome measures" ON outcome_measures
  FOR ALL USING (get_user_role() = 'admin');

-- Functional measures policies
CREATE POLICY "Therapists can view functional measures" ON functional_measures
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage functional measures" ON functional_measures
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- MMT findings policies
CREATE POLICY "Therapists can view MMT findings" ON mmt_findings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage MMT findings" ON mmt_findings
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Spasticity findings policies
CREATE POLICY "Therapists can view spasticity findings" ON spasticity_findings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage spasticity findings" ON spasticity_findings
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Transfer findings policies
CREATE POLICY "Therapists can view transfer findings" ON transfer_findings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage transfer findings" ON transfer_findings
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Gait findings policies
CREATE POLICY "Therapists can view gait findings" ON gait_findings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage gait findings" ON gait_findings
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Grip strength policies
CREATE POLICY "Therapists can view grip strength" ON grip_strength
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage grip strength" ON grip_strength
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Treatment plans policies
CREATE POLICY "Therapists can view treatment plans" ON treatment_plans
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage treatment plans" ON treatment_plans
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM encounters e 
      WHERE e.id = encounter_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Goals policies
CREATE POLICY "Therapists can view goals" ON goals
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Therapists can manage goals" ON goals
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist') AND
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN encounters e ON e.id = tp.encounter_id
      WHERE tp.id = treatment_plan_id 
      AND (e.seen_by = get_user_staff_id() OR get_user_role() = 'admin')
    )
  );

-- Appointments policies
CREATE POLICY "Users can view appointments" ON appointments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

CREATE POLICY "Front desk and therapists can manage appointments" ON appointments
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    get_user_role() IN ('admin', 'therapist', 'front_desk')
  );

-- Time clock policies
CREATE POLICY "Staff can view own time clock" ON time_clock
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    (staff_id = get_user_staff_id() OR get_user_role() = 'admin')
  );

CREATE POLICY "Staff can manage own time clock" ON time_clock
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    staff_id = get_user_staff_id()
  );

CREATE POLICY "Staff can update own time clock" ON time_clock
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    (staff_id = get_user_staff_id() OR get_user_role() = 'admin')
  );

CREATE POLICY "Admin can manage all time clock" ON time_clock
  FOR ALL USING (get_user_role() = 'admin');

-- Audit log policies (admin only)
CREATE POLICY "Admin can view audit log" ON audit_log
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "System can insert audit log" ON audit_log
  FOR INSERT WITH CHECK (true); -- Allow system to insert audit records

-- Sync log policies
CREATE POLICY "Users can view own sync log" ON sync_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own sync log" ON sync_log
  FOR ALL USING (auth.role() = 'authenticated');
