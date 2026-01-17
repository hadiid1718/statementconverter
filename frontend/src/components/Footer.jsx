import React from 'react'

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    textAlign: 'center',
    bottom: 0,
    width: '100%',
    borderTop: '1px solid #e7e7e7'
  }

  return (
    <div style={footerStyle}>
      <p style={{ margin: '0' }}>Copyright © 2025. All Rights Reserved.</p>
    </div>
  )
}

export default Footer
