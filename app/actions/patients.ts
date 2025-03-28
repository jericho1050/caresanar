'use server';


import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import type { Patient } from "@/types/patients";
import { PatientFormValues } from "@/components/patients/new-patient-form";
import { mapPatientToDbPatient, mapDbPatientToPatient } from './utils';


export interface PatientOperationResult {
  success: boolean;
  error?: any;
  data?: any;
}

// Create a new patient
export async function createPatient(patientData: PatientFormValues): Promise<PatientOperationResult> {
  try {
    const supabase = await createClient();;
    
    // Map form fields to database fields
    const dbPatient = {
      // Required fields
      first_name: patientData.firstName,
      last_name: patientData.lastName,
      date_of_birth: patientData.dateOfBirth,
      gender: patientData.gender,
      address: patientData.address,
      phone: patientData.phone,
      email: patientData.email,
      
      // Optional fields
      marital_status: patientData.maritalStatus || null,
      city: patientData.city || null,
      state: patientData.state || null,
      zip_code: patientData.zipCode || null,
      blood_type: patientData.bloodType === 'unknown' ? null : patientData.bloodType,
      allergies: patientData.hasAllergies ? patientData.allergies : null,
      current_medications: patientData.currentMedications || null,
      past_surgeries: patientData.pastSurgeries || null,
      chronic_conditions: patientData.chronicConditions || null,
      
      // Emergency contact fields
      emergency_contact_name: patientData.contactName || null,
      emergency_contact_relationship: patientData.relationship || null,
      emergency_contact_phone: patientData.contactPhone || null,
      
      // Insurance fields (only if hasInsurance is true)
      insurance_provider: patientData.hasInsurance ? patientData.insuranceProvider : null,
      insurance_id: patientData.hasInsurance ? patientData.insuranceId : null,
      insurance_group_number: patientData.hasInsurance ? patientData.groupNumber : null,
      policy_holder_name: patientData.hasInsurance ? patientData.policyHolderName : null,
      relationship_to_patient: patientData.hasInsurance ? patientData.relationshipToPatient : null,
      
      // Status field
      status: patientData.status || 'Admitted',
    };

    // Insert the patient and get the new patient ID
    const { data, error } = await supabase
      .from('patients')
      .insert(dbPatient)
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      const newPatientId = data[0].id;

      // Get a staff ID for the initial medical record
      // In a real scenario, this would be the logged-in staff member
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .limit(1);

      if (staffError) {
        console.error("Error fetching staff for medical record:", staffError);
      } else if (staffData && staffData.length > 0) {
        const staffId = staffData[0].id;

        // Create an initial medical record for the patient
        const initialMedicalRecord = {
          patient_id: newPatientId,
          staff_id: staffId,
          record_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
          diagnosis: patientData.chronicConditions ? 
            `Initial diagnosis: ${patientData.chronicConditions}` : 
            'Initial patient registration',
          treatment: patientData.currentMedications ? 
            `Current medications: ${patientData.currentMedications}` : 
            'No treatment prescribed at registration',
          notes: `Initial medical record created at patient registration. ${
            patientData.hasAllergies && patientData.allergies?.length ? 
            `Allergies: ${patientData.allergies.join(', ')}` : 
            'No known allergies'
          }`,
          vital_signs: JSON.stringify({
            recorded: false,
            note: "Vitals not recorded at registration"
          })
        };

        const { error: medicalRecordError } = await supabase
          .from('medical_records')
          .insert(initialMedicalRecord);

        if (medicalRecordError) {
          console.error("Error creating initial medical record:", medicalRecordError);
        }
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error("Server action error creating patient:", error);
    return { success: false, error };
  }
}

// Update an existing patient
export async function updatePatient(patient: Patient): Promise<PatientOperationResult> {
  try {
    const supabase = await createClient();;
    const dbPatient = mapPatientToDbPatient(patient);
    
    const { data, error } = await supabase
      .from('patients')
      .update(dbPatient)
      .eq('id', patient.id)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Server action error updating patient:", error);
    return { success: false, error };
  }
}

// Delete a patient
export async function deletePatient(patientId: string): Promise<PatientOperationResult> {
  try {
    const supabase = await createClient();;
    
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Server action error deleting patient:", error);
    return { success: false, error };
  }
}

// Get paginated patients with filters
