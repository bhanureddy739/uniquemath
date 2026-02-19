import React from 'react'
import { motion } from 'framer-motion'

const InteractiveElement = ({ children, className = "", onClick, type = "bounce" }) => {
    const variants = {
        bounce: {
            whileHover: { scale: 1.1 },
            whileTap: { scale: 0.9 },
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        pop: {
            whileHover: { scale: 1.2, rotate: 5 },
            whileTap: { scale: 0.8, rotate: -5 },
            transition: { type: "spring", stiffness: 500, damping: 15 }
        }
    }

    return (
        <motion.div
            className={`cursor-pointer inline-block ${className}`}
            onClick={onClick}
            {...variants[type]}
        >
            {children}
        </motion.div>
    )
}

export default InteractiveElement
