import { useEffect, useRef, useState } from 'react'
import './SearchableDropdown.css'

function SearchableDropdown({
    options = [],
    value,
    onChange,
    placeholder = 'Tìm và chọn...',
    allowCustom = true,
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredOptions, setFilteredOptions] = useState(options)
    const wrapperRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        setFilteredOptions(
            options.filter(opt =>
                opt.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
    }, [searchTerm, options])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (option) => {
        onChange(option)
        setSearchTerm('')
        setIsOpen(false)
    }

    const handleInputChange = (e) => {
        const val = e.target.value
        setSearchTerm(val)
        if (allowCustom) {
            onChange(val)
        }
        setIsOpen(true)
    }

    const handleFocus = () => {
        setIsOpen(true)
        setSearchTerm('')
    }

    return (
        <div className={`searchable-dropdown ${disabled ? 'disabled' : ''}`} ref={wrapperRef}>
            <div className="dropdown-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="dropdown-input"
                    placeholder={placeholder}
                    value={isOpen ? searchTerm : (value || '')}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className="dropdown-toggle"
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen(!isOpen)
                            if (!isOpen) inputRef.current?.focus()
                        }
                    }}
                    disabled={disabled}
                >
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                </button>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, idx) => (
                            <div
                                key={idx}
                                className={`dropdown-item ${opt === value ? 'selected' : ''}`}
                                onClick={() => handleSelect(opt)}
                            >
                                {opt}
                            </div>
                        ))
                    ) : (
                        <div className="dropdown-empty">
                            {allowCustom && searchTerm ? (
                                <span>Nhấn Enter để thêm "{searchTerm}"</span>
                            ) : (
                                <span>Không tìm thấy</span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchableDropdown
