import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './SearchableDropdown.css'

function SearchableDropdown({
    options = [],
    value,
    onChange,
    placeholder = 'Tìm và chọn...',
    allowCustom = true,
    portalClassName = '',
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredOptions, setFilteredOptions] = useState(options)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, transform: 'none' })

    const wrapperRef = useRef(null)
    const inputRef = useRef(null)
    const menuRef = useRef(null) // Ref for the portal menu

    useEffect(() => {
        setFilteredOptions(
            options.filter(opt =>
                opt.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
    }, [searchTerm, options])

    // Update coordinates when opening
    useEffect(() => {
        if (isOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect()
            const MENU_MAX_HEIGHT = 200
            const SPACE_BELOW = window.innerHeight - rect.bottom
            const showAbove = SPACE_BELOW < (MENU_MAX_HEIGHT + 10) && rect.top > (MENU_MAX_HEIGHT + 10)

            setCoords({
                top: showAbove
                    ? rect.top + window.scrollY - 4
                    : rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
                transform: showAbove ? 'translateY(-100%)' : 'none'
            })
        }
    }, [isOpen])

    // Optimized Event Listeners: Verify clicks outside BOTH wrapper AND portal menu
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (e) => {
            const clickedWrapper = wrapperRef.current && wrapperRef.current.contains(e.target)
            const clickedMenu = menuRef.current && menuRef.current.contains(e.target)

            if (!clickedWrapper && !clickedMenu) {
                setIsOpen(false)
            }
        }

        // Close on scroll to prevent detached menu
        const handleScroll = () => {
            if (isOpen) setIsOpen(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [isOpen])

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

    const dropdownMenu = (
        <div
            ref={menuRef}
            className={`dropdown-menu portal-dropdown ${portalClassName}`}
            style={{
                position: 'absolute',
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: '200px',
                overflowY: 'auto',
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 9999, // Ensure it's on top of everything
                marginTop: 0, // Reset since we position absolutely
                transform: coords.transform,
                overscrollBehavior: 'contain'
            }}
        >
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
    )

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

            {isOpen && createPortal(dropdownMenu, document.body)}
        </div>
    )
}

export default SearchableDropdown
