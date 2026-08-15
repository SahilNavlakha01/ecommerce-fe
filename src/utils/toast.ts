import toast from 'react-hot-toast'

const baseStyle = {
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: '400',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
  border: 'none'
}

export const successToast = (message: string): void => {
  toast.success(message, {
    duration: 3000,
    style: {
      ...baseStyle,
      background: '#fff',
      color: '#000'
    }
  })
}

export const errorToast = (message: string): void => {
  toast.error(message, {
    duration: 4000,
    style: {
      ...baseStyle,
      background: '#fff',
      color: '#000'
    }
  })
}

export const warningToast = (message: string): void => {
  toast(message, {
    icon: '⚠️',
    duration: 3500,
    style: {
      ...baseStyle,
      background: '#fff',
      color: '#000'
    }
  })
}

export const infoToast = (message: string): void => {
  toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    style: {
      ...baseStyle,
      background: '#fff',
      color: '#000'
    }
  })
}

export const loadingToast = (message: string): string => {
  return toast.loading(message, {
    style: {
      ...baseStyle,
      background: '#fff',
      color: '#000'
    }
  })
}

export const cartToast = (message: string): void => {
  toast.success('Item added to cart successfully', {
    duration: 2500,
    style: {
      ...baseStyle,
      background: '#fff',
      color: '#000'
    }
  })
}

export const wishlistToast = (message: string): void => {
  const isAdded = message.toLowerCase().includes('added')
  toast.success(isAdded ? 'Added to wishlist' : 'Removed from wishlist', {
    duration: 2500,
    style: {
      ...baseStyle,
      background: '#fff',
      color: '#000'
    }
  })
}

export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId)
}