import { supabase } from './supabase'
import { AppointmentInput, Appointment } from '@pal-dental/shared'

export async function createAppointmentInDB(appointment: any) {
  if (!supabase) {
    // Demo mode - return mock response
    return { success: true, data: { id: `apt-${Date.now()}`, ...appointment } }
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        doctor_id: appointment.doctorId,
        patient_name: appointment.patientName,
        patient_phone: appointment.patientPhone,
        date: appointment.date,
        time: appointment.time,
        notes: appointment.notes || null,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return { success: false, error: error.message }
  }
}

export async function getDoctorsFromDB(city?: string, specialty?: string) {
  if (!supabase) return null

  try {
    let query = supabase.from('doctors').select('*').eq('verified', true)
    
    if (city) query = query.eq('city', city)
    if (specialty) query = query.eq('specialty', specialty)

    const { data, error } = await query

    if (error) throw error
    
    return data
  } catch (error: any) {
    console.error('Error fetching doctors:', error)
    return null
  }
}

export async function trackAdClickInDB(adId: string) {
  if (!supabase) return

  try {
    const { data, error: fetchError } = await supabase
      .from('advertisements')
      .select('clicks')
      .eq('id', adId)
      .single()

    if (!fetchError && data) {
      await supabase
        .from('advertisements')
        .update({ clicks: (data.clicks || 0) + 1 })
        .eq('id', adId)
    }
  } catch (error) {
    console.error('Error tracking click:', error)
  }
}
