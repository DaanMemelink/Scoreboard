
function Box({children, className = "", isSmall = false, showSticker = true}) {
    return (
        <div className={`box ${className} ${showSticker && 'sticker'} ${isSmall && 'small'}`}>
            {children}
        </div>
    )
}

export default Box