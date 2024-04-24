import React from 'react'
import PropTypes from 'prop-types';
import './index.scss'

const Loader = ({ size }) => {
  return (
    <div className={`loader ${size}`}></div>
  )
}

Loader.propTypes = {
   size: PropTypes.oneOf(['small']),
}

Loader

export default Loader