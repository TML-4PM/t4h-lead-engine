import { useState, FormEvent } from 'react'
import { BizConfig } from '../lib/bizConfigs'
import { submitLead } from '../lib/leadEngine'

interface Props { config: BizConfig }

export default function LeadForm({ config }: Props) {
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', company:'', role_title:'', message:'', consent_terms: false, consent_marketing: false })
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const set = (k: string, v: string | boolean) => setForm(f => ({...f, [k]: v}))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.consent_terms) { setErrMsg('Please accept the terms to continue.'); return }
    setStatus('loading'); setErrMsg('')
    const result = await submitLead({
      biz_key: config.biz_key, lead_type: config.leadType,
      full_name: form.full_name, email: form.email,
      phone: form.phone || undefined, company: form.company || undefined,
      role_title: form.role_title || undefined, message: form.message || undefined,
      consent_terms: form.consent_terms, consent_marketing: form.consent_marketing
    })
    if (result.success) { setStatus('success') }
    else { setStatus('error'); setErrMsg(result.error || 'Something went wrong. Please try again.') }
  }

  if (status === 'success') return (
    <div style={{background:'#f0fdf4',border:'2px solid #22c55e',borderRadius:12,padding:'2rem',textAlign:'center'}}>
      <div style={{fontSize:'3rem',marginBottom:'1rem'}}>✅</div>
      <h3 style={{fontSize:'1.25rem',fontWeight:700,color:'#15803d',marginBottom:'0.5rem'}}>You&apos;re in!</h3>
      <p style={{color:'#166534'}}>{config.thankYouMsg}</p>
    </div>
  )

  return (
    <form onSubmit={onSubmit} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div>
        <label style={{display:'block',fontSize:'0.875rem',fontWeight:600,marginBottom:'0.25rem',color:'#374151'}}>Full Name *</label>
        <input required value={form.full_name} onChange={e=>set('full_name',e.target.value)}
          placeholder="Your full name"
          style={{width:'100%',padding:'0.625rem 0.875rem',border:'1.5px solid #d1d5db',borderRadius:8,fontSize:'0.95rem',boxSizing:'border-box'}} />
      </div>
      <div>
        <label style={{display:'block',fontSize:'0.875rem',fontWeight:600,marginBottom:'0.25rem',color:'#374151'}}>Email *</label>
        <input required type="email" value={form.email} onChange={e=>set('email',e.target.value)}
          placeholder="your@email.com"
          style={{width:'100%',padding:'0.625rem 0.875rem',border:'1.5px solid #d1d5db',borderRadius:8,fontSize:'0.95rem',boxSizing:'border-box'}} />
      </div>
      {config.formFields.includes('phone') && (
        <div>
          <label style={{display:'block',fontSize:'0.875rem',fontWeight:600,marginBottom:'0.25rem',color:'#374151'}}>Phone</label>
          <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}
            placeholder="+61 4xx xxx xxx"
            style={{width:'100%',padding:'0.625rem 0.875rem',border:'1.5px solid #d1d5db',borderRadius:8,fontSize:'0.95rem',boxSizing:'border-box'}} />
        </div>
      )}
      {config.formFields.includes('company') && (
        <div>
          <label style={{display:'block',fontSize:'0.875rem',fontWeight:600,marginBottom:'0.25rem',color:'#374151'}}>Company</label>
          <input value={form.company} onChange={e=>set('company',e.target.value)}
            placeholder="Your company"
            style={{width:'100%',padding:'0.625rem 0.875rem',border:'1.5px solid #d1d5db',borderRadius:8,fontSize:'0.95rem',boxSizing:'border-box'}} />
        </div>
      )}
      {config.formFields.includes('role') && (
        <div>
          <label style={{display:'block',fontSize:'0.875rem',fontWeight:600,marginBottom:'0.25rem',color:'#374151'}}>Your Role</label>
          <input value={form.role_title} onChange={e=>set('role_title',e.target.value)}
            placeholder="e.g. CEO, Operations Manager"
            style={{width:'100%',padding:'0.625rem 0.875rem',border:'1.5px solid #d1d5db',borderRadius:8,fontSize:'0.95rem',boxSizing:'border-box'}} />
        </div>
      )}
      {config.formFields.includes('message') && (
        <div>
          <label style={{display:'block',fontSize:'0.875rem',fontWeight:600,marginBottom:'0.25rem',color:'#374151'}}>Message</label>
          <textarea value={form.message} onChange={e=>set('message',e.target.value)}
            rows={3} placeholder="Tell us about your situation..."
            style={{width:'100%',padding:'0.625rem 0.875rem',border:'1.5px solid #d1d5db',borderRadius:8,fontSize:'0.95rem',resize:'vertical',boxSizing:'border-box'}} />
        </div>
      )}
      <label style={{display:'flex',alignItems:'flex-start',gap:'0.5rem',cursor:'pointer',fontSize:'0.8rem',color:'#6b7280'}}>
        <input type="checkbox" checked={form.consent_terms} onChange={e=>set('consent_terms',e.target.checked)} style={{marginTop:2,flexShrink:0}} />
        I agree to the Terms of Service and Privacy Policy *
      </label>
      <label style={{display:'flex',alignItems:'flex-start',gap:'0.5rem',cursor:'pointer',fontSize:'0.8rem',color:'#6b7280'}}>
        <input type="checkbox" checked={form.consent_marketing} onChange={e=>set('consent_marketing',e.target.checked)} style={{marginTop:2,flexShrink:0}} />
        I&apos;d like to receive updates and offers from {config.name}
      </label>
      {errMsg && <p style={{color:'#dc2626',fontSize:'0.875rem',margin:0}}>{errMsg}</p>}
      <button type="submit" disabled={status==='loading'}
        style={{background:config.primaryColor,color:'white',border:'none',padding:'0.75rem 1.5rem',borderRadius:8,fontSize:'1rem',fontWeight:700,cursor:status==='loading'?'not-allowed':'pointer',opacity:status==='loading'?0.7:1,marginTop:'0.25rem'}}>
        {status==='loading' ? 'Submitting...' : config.ctaLabel}
      </button>
    </form>
  )
}
