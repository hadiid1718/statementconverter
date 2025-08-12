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
      <p style={{ margin: '5px 0 0 0', color: '#666' }}>Developed By Mujeeb Ahmed</p>
    </div>
  )
}

export default Footer
