import Head from 'next/head'
import { getBizConfig } from '../lib/bizConfigs'
import LeadForm from '../components/LeadForm'

export default function Home() {
  const c = getBizConfig()
  return (
    <>
      <Head>
        <title>{c.name} — {c.tagline}</title>
        <meta name="description" content={c.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',minHeight:'100vh',background:'#f9fafb'}}>
        {/* Nav */}
        <nav style={{background:'white',borderBottom:'1px solid #e5e7eb',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontWeight:800,fontSize:'1.25rem',color:c.primaryColor}}>{c.name}</span>
          <span style={{fontSize:'0.875rem',color:'#6b7280'}}>Powered by Tech 4 Humanity</span>
        </nav>

        {/* Hero */}
        <section style={{background:`linear-gradient(135deg, ${c.primaryColor}15 0%, ${c.accentColor}20 100%)`,padding:'4rem 2rem 3rem',textAlign:'center'}}>
          <div style={{maxWidth:700,margin:'0 auto'}}>
            <div style={{display:'inline-block',background:c.primaryColor,color:'white',padding:'0.35rem 1rem',borderRadius:100,fontSize:'0.8rem',fontWeight:600,marginBottom:'1.25rem',letterSpacing:'0.05em',textTransform:'uppercase'}}>
              {c.offer}
            </div>
            <h1 style={{fontSize:'clamp(2rem,5vw,3rem)',fontWeight:900,color:'#111827',lineHeight:1.15,marginBottom:'1rem'}}>
              {c.tagline}
            </h1>
            <p style={{fontSize:'1.125rem',color:'#4b5563',lineHeight:1.7,marginBottom:0}}>{c.description}</p>
          </div>
        </section>

        {/* Main */}
        <section style={{maxWidth:1100,margin:'0 auto',padding:'3rem 2rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem',alignItems:'start'}}>
          {/* Benefits */}
          <div>
            <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#111827',marginBottom:'1.5rem'}}>Why {c.name}?</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'2rem'}}>
              {c.benefits.map((b, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'0.75rem',background:'white',padding:'0.875rem 1rem',borderRadius:10,boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:`${c.primaryColor}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{color:c.primaryColor,fontSize:'0.9rem'}}>✓</span>
                  </div>
                  <span style={{fontWeight:600,color:'#374151'}}>{b}</span>
                </div>
              ))}
            </div>
            <div style={{background:'white',borderRadius:12,padding:'1.25rem',boxShadow:'0 1px 3px rgba(0,0,0,0.08)',borderLeft:`4px solid ${c.primaryColor}`}}>
              <p style={{margin:0,fontSize:'0.9rem',color:'#6b7280',fontStyle:'italic'}}>
                &ldquo;Part of the Tech 4 Humanity portfolio — building AI tools for real human outcomes.&rdquo;
              </p>
            </div>
          </div>

          {/* Form */}
          <div style={{background:'white',borderRadius:16,padding:'2rem',boxShadow:'0 4px 24px rgba(0,0,0,0.1)',border:`1px solid ${c.primaryColor}30`}}>
            <h3 style={{fontSize:'1.25rem',fontWeight:800,color:'#111827',marginBottom:'0.375rem'}}>{c.offer}</h3>
            <p style={{color:'#6b7280',fontSize:'0.9rem',marginBottom:'1.5rem'}}>Fill in your details and we&apos;ll be in touch shortly.</p>
            <LeadForm config={c} />
          </div>
        </section>

        {/* Footer */}
        <footer style={{borderTop:'1px solid #e5e7eb',padding:'1.5rem 2rem',textAlign:'center',color:'#9ca3af',fontSize:'0.8rem'}}>
          © {new Date().getFullYear()} {c.name} — A Tech 4 Humanity Ltd company · ABN 61 605 746 618
        </footer>
      </div>

      <style>{`@media(max-width:768px){section[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
    </>
  )
}
