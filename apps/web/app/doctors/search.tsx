'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Doctor } from '@pal-dental/shared'
import { ArrowRight } from 'lucide-react'

const CITIES = ['Ramallah', 'Nablus', 'Hebron', 'Jerusalem', 'Bethlehem', 'Gaza City']
const SPECIALTIES = ['Orthodontics', 'Dental Surgery', 'Pediatric Dentistry', 'Implantology', 'Cosmetic Dentistry', 'Endodontics']

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    city: searchParams?.get('city') || '',
    specialty: searchParams?.get('specialty') || '',
    insurance: searchParams?.get('insurance') || 'any'
  })

  useEffect(() => {
    fetchDoctors()
  }, [filters])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.city) params.append('city', filters.city)
      if (filters.specialty) params.append('specialty', filters.specialty)

      const response = await fetch(`/api/doctors?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      let data = await response.json()
      
      // Client-side filtering for insurance
      if (filters.insurance === 'yes') {
        data = data.filter((d: Doctor) => d.acceptsInsurance || d.accepts_insurance)
      } else if (filters.insurance === 'no') {
        data = data.filter((d: Doctor) => !(d.acceptsInsurance || d.accepts_insurance))
      }

      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <main>
      <section className="shell page-layout pt-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
          >
            <ArrowRight className="w-4 h-4" />
            الرئيسية
          </Link>
        </div>
        <div className="section-head">
          <div>
            <p className="eyebrow">Search</p>
            <h1>Find your dentist</h1>
            <p>Filter by location, specialty, and more</p>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="panel">
          <div className="search-grid">
            <select 
              value={filters.city} 
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="field"
            >
              <option value="">All cities</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select 
              value={filters.specialty} 
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              className="field"
            >
              <option value="">All specialties</option>
              {SPECIALTIES.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select 
              value={filters.insurance} 
              onChange={(e) => handleFilterChange('insurance', e.target.value)}
              className="field"
            >
              <option value="any">Any insurance</option>
              <option value="yes">Accepts insurance</option>
              <option value="no">Self-pay only</option>
            </select>

            <button 
              className="button" 
              onClick={fetchDoctors}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading && <p>Loading doctors...</p>}

        {!loading && doctors.length === 0 && (
          <div className="panel">
            <p>No doctors found matching your filters. Try adjusting your search.</p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <>
            <p style={{ marginTop: 20, marginBottom: 20 }}>
              Found <strong>{doctors.length}</strong> {doctors.length === 1 ? 'doctor' : 'doctors'}
            </p>

            <div className="doctor-grid">
              {doctors.map((doctor: Doctor) => (
                <article className="panel doctor-card" key={doctor.id}>
                  <div className="doctor-cover">
                    <img 
                      alt={doctor.name} 
                      src={doctor.imageUrl || doctor.image_url || 'https://via.placeholder.com/300x200?text=Doctor'} 
                      loading="lazy"
                    />
                  </div>

                  <div className="tag-row">
                    {(doctor.isFeatured || doctor.is_featured) && <span className="tag">Featured</span>}
                    {doctor.verified && <span className="tag">Verified</span>}
                    <span className="tag">{doctor.specialty}</span>
                  </div>

                  <div>
                    <h3>{doctor.name}</h3>
                    <p>
                      {doctor.area}, {doctor.city}
                    </p>
                  </div>

                  <div className="meta">
                    <span>⭐ {doctor.rating}</span>
                    <span>{(doctor.acceptsInsurance || doctor.accepts_insurance) ? '🏥 Insurance' : '💳 Self-pay'}</span>
                  </div>

                  <div className="tag-row">
                    <Link className="button" href={`/doctors/${doctor.id}`}>
                      View profile
                    </Link>
                    {(doctor.whatsapp || doctor.whatsapp) && (
                      <a 
                        className="button secondary" 
                        href={`https://wa.me/${(doctor.whatsapp || doctor.whatsapp || '').replace('+', '')}`}
                        target="_blank"
                        rel="noopener"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
