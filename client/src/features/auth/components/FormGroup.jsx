import React from 'react'
import '../styles/_form-group.scss'

const FormGroup = ({ label, id, placeholder, type, value, onChange, name }) => {
  return (
    <div className='form-group'>
      <input
        value={value}
        onChange={onChange}
        name={name || id}
        className='form-input'
        type={type}
        id={id}
        placeholder={placeholder || " "} />
      <label className='form-label' htmlFor={id}>{label}</label>
    </div>
  )
}

export default FormGroup