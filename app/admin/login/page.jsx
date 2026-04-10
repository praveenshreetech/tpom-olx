'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()

  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const handle = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }))
    setError('')
  }

  const blur = (e) => {
    setTouched((t) => ({
      ...t,
      [e.target.name]: true,
    }))
  }

  const usernameErr =
    touched.username && !form.username
      ? 'Username is required'
      : ''

  const passwordErr =
    touched.password && !form.password
      ? 'Password is required'
      : ''

  const submit = async (e) => {
    e.preventDefault()

    setTouched({
      username: true,
      password: true,
    })

    if (!form.username || !form.password) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/admin/')
    } else {
      const data = await res.json()
      setError(data.error || 'Invalid username or password')
      setLoading(false)
    }
  }

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9F7F4',
      padding: '24px',
    },
    card: {
      background: '#ffff',
      border: '1px solid #C8943A',
      borderRadius: '20px',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
    },
    logo: {
      fontSize: '24px',
      fontWeight: '800',
      color: 'white',
      marginBottom: '6px',
    },
    sub: {
      fontSize: '14px',
      color: '#9ca3af',
      marginBottom: '32px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#000000',
    },
    inputWrap: {
      border: '1px solid #C8943A',
      borderRadius: '10px',
      padding: '0 14px',
      background: '#f2d0960d',
    },
    input: {
      width: '100%',
      background: 'none',
      border: 'none',
      padding: '13px 0',
      fontSize: '15px',
      color: '#0000009b',
      outline: 'none',
    },
    errorText: {
      fontSize: '12px',
      color: 'red',
      marginTop: '4px',
    },
    errorBox: {
      background: 'rgba(255,0,0,0.08)',
      border: '1px solid rgba(255,0,0,0.25)',
      borderRadius: '10px',
      padding: '12px 14px',
      color: 'red',
      fontSize: '14px',
    },
    button: {
      background: '#C8943A',
      color: '#fff',
      padding: '14px',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '10px',
    },
    hint: {
      textAlign: 'center',
      marginTop: '20px',
      color: '#9ca3af',
    },
    link: {
      color: '#9ca3af',
      textDecoration: 'none',
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          Market<span style={{ color: '#e8ff47' }}>Admin</span>
        </div>

        <p style={styles.sub}>Sign in to your admin panel</p>

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handle}
                onBlur={blur}
                placeholder="Enter username"
                style={styles.input}
              />
            </div>
            {usernameErr && (
              <p style={styles.errorText}>{usernameErr}</p>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                onBlur={blur}
                placeholder="Enter password"
                style={styles.input}
              />
            </div>
            {passwordErr && (
              <p style={styles.errorText}>{passwordErr}</p>
            )}
          </div>

          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}

          <button type="submit" style={styles.button}>
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.hint}>
          ← <a href="/" style={styles.link}>Back to site</a>
        </p>
      </div>
    </div>
  )
}