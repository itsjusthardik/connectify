import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import axios from '../../api/axios'

/**
 * MyDemandsPage
 * View and manage user's own demand posts
 */
export default function MyDemandsPage() {
  const { user } = useAuth()
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyDemands()
  }, [])

  const fetchMyDemands = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/demands/mine')
      setDemands(res.data.demands || [])
    } catch (error) {
      console.error('Failed to fetch my demands', error)
      toast.error('Failed to load your posts')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async (demandId) => {
    try {
      const res = await axios.put(`/demands/${demandId}/close`)
      if (res.data.success) {
        toast.success('Post closed!')
        setDemands(prev => prev.map(d => d._id === demandId ? {...d, status: 'closed'} : d))
      }
    } catch (error) {
      toast.error('Failed to close post')
    }
  }

  const handleDelete = async (demandId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    
    try {
      const res = await axios.delete(`/demands/${demandId}`)
      if (res.data.success) {
        toast.success('Post deleted!')
        setDemands(prev => prev.filter(d => d._id !== demandId))
      }
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>My Posts</h1>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading your posts...</div>
          ) : demands.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <p>No posts yet. <a href="/demands" style={{color: '#6366F1'}}>Create one now!</a></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {demands.map(demand => (
                <motion.div
                  key={demand._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{demand.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {demand.category.replace('need_', '').replace(/_/g, ' ')} • {new Date(demand.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ background: demand.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(82,82,91,0.2)', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: demand.status === 'open' ? '#10B981' : '#52525B', fontWeight: 600 }}>
                      {demand.status === 'open' ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ color: 'var(--text)', marginBottom: '1rem', lineHeight: 1.5 }}>{demand.description}</p>

                  {/* Details */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {demand.budget > 0 && (
                      <div style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                        ₹{demand.budget} {demand.budgetType === 'per_hour' ? '/hr' : ''}
                      </div>
                    )}
                    {demand.deadline && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Due: {new Date(demand.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Responses */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Responses ({demand.responses?.length || 0})</h4>
                    {demand.responses?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {demand.responses.map((response, idx) => (
                          <div key={idx} style={{ background: 'var(--surface)', padding: '0.8rem', borderRadius: '8px' }}>
                            <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                              {response.user?.name} • {response.user?.role.replace(/_/g, ' ')}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{response.message}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>
                              {new Date(response.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No responses yet</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {demand.status === 'open' && (
                      <button
                        onClick={() => handleClose(demand._id)}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239,68,68,0.2)',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}
                      >
                        Close Post
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(demand._id)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: '#EF4444',
                        border: '1px solid rgba(239,68,68,0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
