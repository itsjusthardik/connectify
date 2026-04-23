import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/common/Navbar'
import { AnimatedInput } from '../../components/ui/AnimatedInput'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import axios from '../../api/axios'
import { X, Send } from 'lucide-react'

/**
 * DemandsPage
 * Browse and create demands
 * Form to post requirements, feed to view others' posts
 */
export default function DemandsPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    budget: '',
    budgetType: 'negotiable',
    deadline: '',
    skills: []
  })
  const [skillInput, setSkillInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [respondingTo, setRespondingTo] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [hasResponded, setHasResponded] = useState({})

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'need_video_editor', label: 'Need Video Editor' },
    { id: 'need_graphic_designer', label: 'Need Graphic Designer' },
    { id: 'need_content_creator', label: 'Need Content Creator' },
    { id: 'need_brand_promotion', label: 'Need Brand Promotion' },
    { id: 'need_collaboration', label: 'Need Collaboration' },
    { id: 'other', label: 'Other' }
  ]

  useEffect(() => {
    fetchDemands()
  }, [selectedCategory, page])

  const fetchDemands = async () => {
    try {
      setLoading(true)
      const query = selectedCategory !== 'all' ? `?category=${selectedCategory}&page=${page}` : `?page=${page}`
      const res = await axios.get(`/demands${query}`)
      setDemands(res.data.demands || [])
    } catch (error) {
      console.error('Failed to fetch demands', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDemand = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post('/demands', {
        ...formData,
        budget: formData.budget ? parseInt(formData.budget) : 0
      })
      
      if (res.data.success) {
        toast.success('Post published successfully!')
        setFormData({
          title: '',
          description: '',
          category: 'other',
          budget: '',
          budgetType: 'negotiable',
          deadline: '',
          skills: []
        })
        setShowForm(false)
        setPage(1)
        fetchDemands()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRespond = async (demandId) => {
    if (!responseMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      const res = await axios.post(`/demands/${demandId}/respond`, {
        message: responseMessage
      })
      
      if (res.data.success) {
        toast.success('Response sent!')
        setRespondingTo(null)
        setResponseMessage('')
        setHasResponded(prev => ({...prev, [demandId]: true}))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send response')
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Posts & Requirements</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Post what you need or respond to others' posts</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                background: '#6366F1',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              {showForm ? 'Cancel' : 'Post a Requirement'}
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem'
              }}
            >
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 600 }}>Create a Post</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Title</label>
                  <AnimatedInput
                    label="Post Title"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="What do you need?"
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Description ({formData.description.length}/1000)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    maxLength={1000}
                    placeholder="Describe what you're looking for..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      background: 'var(--input-bg)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      style={{
                        width: '100%',
                        background: 'var(--input-bg)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                        padding: '0.85rem',
                        color: 'var(--text)',
                        fontSize: '0.95rem'
                      }}
                    >
                      {categories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Budget (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                      placeholder="0"
                      style={{
                        width: '100%',
                        background: 'var(--input-bg)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                        padding: '0.85rem',
                        color: 'var(--text)',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Budget Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['fixed', 'per_hour', 'negotiable'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({...formData, budgetType: type})}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: formData.budgetType === type ? 'none' : '1px solid var(--border)',
                          background: formData.budgetType === type ? '#6366F1' : 'var(--surface)',
                          color: formData.budgetType === type ? 'white' : 'var(--text)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Deadline (optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    style={{
                      width: '100%',
                      background: 'var(--input-bg)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '12px',
                      padding: '0.85rem',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Skills Needed</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addSkill()}
                      placeholder="Enter a skill..."
                      style={{
                        flex: 1,
                        background: 'var(--input-bg)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.6rem',
                        color: 'var(--text)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      onClick={addSkill}
                      style={{
                        background: '#6366F1',
                        color: 'white',
                        border: 'none',
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.skills.map(skill => (
                      <div
                        key={skill}
                        style={{
                          background: 'rgba(99,102,241,0.2)',
                          border: '1px solid rgba(99,102,241,0.3)',
                          borderRadius: '6px',
                          padding: '0.4rem 0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateDemand}
                  disabled={submitting}
                  style={{
                    background: '#6366F1',
                    color: 'white',
                    border: 'none',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '20px',
                  border: selectedCategory === cat.id ? 'none' : '1px solid var(--border)',
                  background: selectedCategory === cat.id ? '#6366F1' : 'var(--surface)',
                  color: selectedCategory === cat.id ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading posts...</div>
            ) : demands.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No posts found</div>
            ) : (
              demands.map(demand => (
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
                        {demand.author?.name} • {demand.category.replace('need_', '').replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div style={{ background: demand.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(82,82,91,0.2)', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: demand.status === 'open' ? '#10B981' : '#52525B', fontWeight: 600 }}>
                      {demand.status === 'open' ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ color: 'var(--text)', marginBottom: '1rem', lineHeight: 1.5 }}>{demand.description.substring(0, 150)}{demand.description.length > 150 ? '...' : ''}</p>

                  {/* Budget & Skills */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
                    {demand.skills.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {demand.skills.slice(0, 2).map(skill => (
                          <span key={skill} style={{ background: 'var(--surface)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                            {skill}
                          </span>
                        ))}
                        {demand.skills.length > 2 && (
                          <span style={{ background: 'var(--surface)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                            +{demand.skills.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Responses info */}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {demand.responses?.length || 0} response{((demand.responses?.length || 0) !== 1) ? 's' : ''}
                  </p>

                  {/* Action */}
                  {demand.status === 'open' && demand.author?._id !== user?._id && (
                    <div>
                      {hasResponded[demand._id] || demand.responses?.some(r => r.user?._id === user?._id) ? (
                        <div style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 600 }}>✓ Responded</div>
                      ) : (
                        <>
                          {respondingTo === demand._id ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <textarea
                                value={responseMessage}
                                onChange={e => setResponseMessage(e.target.value)}
                                placeholder="Your message..."
                                maxLength={500}
                                style={{
                                  flex: 1,
                                  minHeight: '60px',
                                  background: 'var(--input-bg)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '8px',
                                  padding: '0.6rem',
                                  color: 'var(--text)',
                                  fontSize: '0.9rem',
                                  fontFamily: 'inherit',
                                  boxSizing: 'border-box'
                                }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <button
                                  onClick={() => handleRespond(demand._id)}
                                  style={{
                                    background: '#6366F1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 0.8rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <Send size={14} />
                                </button>
                                <button
                                  onClick={() => setRespondingTo(null)}
                                  style={{
                                    background: 'var(--surface)',
                                    color: 'var(--text)',
                                    border: 'none',
                                    padding: '0.5rem 0.8rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRespondingTo(demand._id)}
                              style={{
                                background: '#6366F1',
                                color: 'white',
                                border: 'none',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                              }}
                            >
                              Respond
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
