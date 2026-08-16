// Base URL configuration
export const BASE_URL = "http://localhost:5001/api/"
// export const BASE_URL = "https://jwellerybackend-production.up.railway.app/api/"
// export const BASE_URL = "https://api.nscollection.com/api/"


// WebSocket URL
// export const WS_BASE_URL = "ws://localhost:5000"
// export const WS_BASE_URL = "wss://jwellerybackend-production.up.railway.app"
export const WS_BASE_URL = "wss://api.nscollection.com"
// USER endpoints
export const REGISTER_USER = BASE_URL + "users/register"
export const LOGIN_USER = BASE_URL + "users/login"
export const LOGIN_ADMIN = BASE_URL + "users/login"
export const GET_ALL_USERS = BASE_URL + "users/"
export const GET_SINGLE_USER = BASE_URL + "users/"
export const UPDATE_USER = BASE_URL + "users/"
export const RESET_PASSWORD = BASE_URL + "users/"
export const SEND_OTP_PASSWORD_RESET = BASE_URL + "verify/send-otp-password-reset"
export const RESET_PASSWORD_WITH_OTP = BASE_URL + "verify/reset-password"
export const SEND_OTP = BASE_URL + "verify/send-otp"
export const VERIFY_OTP = BASE_URL + "verify/confirm-otp"
export const VERIFY_CONTACT_CHECKOUT = BASE_URL + "verify/verify-contact-checkout"
export const VERIFY_EMAIL_CHECKOUT = BASE_URL + "verify/verify-email-checkout"
export const REGISTER_USER_AUTH = BASE_URL + "users/register"
export const REGISTER_B2B_USER = BASE_URL + "users/register-b2b"
export const REGISTER_WITH_PHONE = BASE_URL + "users/register-with-phone"
export const CHECK_PHONE = BASE_URL + "users/check-phone"
export const GET_CONFIG = BASE_URL + "config/getConfig"
export const GET_ALL_CONFIG = BASE_URL + "config/getAll"
export const ADD_CONFIG = BASE_URL + "config/add"
export const UPDATE_CONFIG = BASE_URL + "config/update/"
export const DELETE_CONFIG = BASE_URL + "config/delete/"

// PRODUCT endpoints
export const ADD_PRODUCT = BASE_URL + "products/add"
export const ADD_PRODUCT_WITH_IMAGES = BASE_URL + "products/addWithImages"
export const GET_ALL_PRODUCTS = BASE_URL + "products/fetch"
export const GET_SINGLE_PRODUCT = BASE_URL + "products/fetch/"
export const UPDATE_PRODUCT = BASE_URL + "products/update/"
export const UPDATE_PRODUCT_WITH_IMAGES = BASE_URL + "products/updateWithImages/"
export const DELETE_PRODUCT = BASE_URL + "products/delete/"
export const UPDATE_STOCK = BASE_URL + "products/update-stock/"
export const UPDATE_TOP_PRODUCTS = BASE_URL + "products/top-products"

// PRODUCT IMAGES endpoints
export const UPLOAD_PRODUCT_IMAGES = BASE_URL + "productImages/productImagesUpload"
export const GET_PRODUCT_IMAGES = BASE_URL + "productImages/fetch/"
export const DELETE_PRODUCT_IMAGE = BASE_URL + "productImages/delete/"

// CATEGORY endpoints
export const ADD_CATEGORY = BASE_URL + "categories/add"
export const GET_ALL_CATEGORIES = BASE_URL + "categories/fetch"
export const GET_SINGLE_CATEGORY = BASE_URL + "categories/fetchOne/"
export const UPDATE_CATEGORY = BASE_URL + "categories/update/"
export const DELETE_CATEGORY = BASE_URL + "categories/delete/"

// BANNER endpoints
export const ADD_BANNER = BASE_URL + "banners/add"
export const GET_ALL_BANNERS = BASE_URL + "banners/fetch"
export const GET_ACTIVE_BANNERS = BASE_URL + "banners/fetch-active"
export const UPDATE_BANNER = BASE_URL + "banners/update/"
export const DELETE_BANNER = BASE_URL + "banners/delete/"
export const UPDATE_BANNER_ORDER = BASE_URL + "banners/order"

// SUBCATEGORY endpoints
export const ADD_SUBCATEGORY = BASE_URL + "subcategories/add"
export const GET_ALL_SUBCATEGORIES = BASE_URL + "subcategories/fetch"
export const GET_SUBCATEGORIES_BY_CATEGORY = BASE_URL + "subcategories/category/"
export const GET_SUBCATEGORIES_BY_PARENT = BASE_URL + "subcategories/parent/"
export const GET_SINGLE_SUBCATEGORY = BASE_URL + "subcategories/fetchOne/"
export const UPDATE_SUBCATEGORY = BASE_URL + "subcategories/update/"
export const DELETE_SUBCATEGORY = BASE_URL + "subcategories/delete/"

// ORDER endpoints
export const GET_ALL_ORDERS = BASE_URL + "orders/all"
export const EXPORT_ORDERS = BASE_URL + "orders/export"
export const GET_USER_ORDERS = BASE_URL + "orders/userOrders/"
export const GET_ORDER_ITEMS = BASE_URL + "orders/orderItems/"
export const GET_ORDER_WITH_TRACKING = BASE_URL + "orders/orderItems/"
export const GET_DELIVERY_ESTIMATE = BASE_URL + "orders/delivery-estimate"
export const CHECKOUT_ORDER = BASE_URL + "orders/checkout"
export const CREATE_RAZORPAY_ORDER = BASE_URL + "orders/create-razorpay-order"
export const VERIFY_PAYMENT = BASE_URL + "orders/verify-payment"
export const UPDATE_ORDER_STATUS = BASE_URL + "orders/update-status/"
export const APPLY_COUPON = BASE_URL + "coupons/apply-coupon"
export const CANCEL_PAYMENT = BASE_URL + "orders/cancel-payment"
export const CREATE_COD_CHARGE_ORDER = BASE_URL + "orders/create-cod-charge-order"

// ADDRESS endpoints
export const FETCH_ADDRESSES = BASE_URL + "addresses/fetch"
export const FETCH_ONE_ADDRESS = BASE_URL + "addresses/fetchOne/"
export const ADD_ADDRESS = BASE_URL + "addresses/add"
export const UPDATE_ADDRESS = BASE_URL + "addresses/update/"
export const DELETE_ADDRESS = BASE_URL + "addresses/delete/"
export const GET_STATES = BASE_URL + "addresses/states"

// CART endpoints
export const ADD_TO_CART = BASE_URL + "cart/add"
export const UPDATE_CART_QUANTITY = BASE_URL + "cart/update-quantity"
export const FETCH_CART = BASE_URL + "cart/fetch/"
export const DELETE_CART_ITEM = BASE_URL + "cart/deleteOne/"
export const CLEAR_CART = BASE_URL + "cart/clear/"
export const CLEAR_USER_CART = BASE_URL + "cart/admin/clear-user/"
export const CLEAR_ALL_CARTS = BASE_URL + "cart/admin/clear-all"
export const REMOVE_USER_CART_ITEMS = BASE_URL + "cart/admin/remove-items/"
export const CART_ESTIMATION = BASE_URL + "cart/estimation/"

// WISHLIST endpoints
export const ADD_TO_WISHLIST = BASE_URL + "wishlist/add"
export const FETCH_WISHLIST = BASE_URL + "wishlist/fetch/"
export const REMOVE_FROM_WISHLIST = BASE_URL + "wishlist/remove"

// REVIEW endpoints
export const ADD_REVIEW = BASE_URL + "review/add"
export const GET_PRODUCT_REVIEWS = BASE_URL + "review/product/"
export const DELETE_REVIEW = BASE_URL + "review/delete"

// BULK UPLOAD endpoints
export const BULK_UPLOAD_PRODUCTS = BASE_URL + "bulk/bulk-upload"
export const BULK_UPLOAD_BATCH = BASE_URL + "bulk/batch-upload"
export const DOWNLOAD_BULK_TEMPLATE = BASE_URL + "bulk/template"
export const CHECK_UPLOAD_STATUS = BASE_URL + "bulk/status/"
export const GET_UPLOADED_FILES = BASE_URL + "bulk/files"
export const DOWNLOAD_UPLOADED_FILE = BASE_URL + "bulk/download/"
export const DELETE_UPLOADED_FILE = BASE_URL + "bulk/files/"

// INVOICE endpoints
export const GET_INVOICE_BY_NUMBER = BASE_URL + "bills/invoice/"
export const GET_INVOICE_BY_ORDER_ID = BASE_URL + "bills/invoice/order/"

// CONTACT endpoints
export const SEND_CONTACT_EMAIL = BASE_URL + "contact/send"

// COUPON endpoints
export const ADD_COUPON = BASE_URL + "coupons/add"
export const GET_ALL_COUPONS = BASE_URL + "coupons/fetch"
export const GET_ACTIVE_NEW_USER_COUPON = BASE_URL + "coupons/new-user-coupon"
export const GET_ACTIVE_COUPONS = BASE_URL + "coupons/fetch-active"
export const UPDATE_COUPON = BASE_URL + "coupons/update/"
export const DELETE_COUPON = BASE_URL + "coupons/delete/"

// DASHBOARD endpoints
export const GET_DASHBOARD_STATS = BASE_URL + "dashboard/stats"
export const GET_DASHBOARD_RECENT_ORDERS = BASE_URL + "dashboard/recent-orders"
export const GET_DASHBOARD_LOW_STOCK = BASE_URL + "dashboard/low-stock"

// MANUAL INVOICE endpoints
export const GET_ALL_MANUAL_INVOICES = BASE_URL + "manual-invoices/"
export const GET_MANUAL_INVOICE = BASE_URL + "manual-invoices/"
export const CREATE_MANUAL_INVOICE = BASE_URL + "manual-invoices/create"
export const UPDATE_MANUAL_INVOICE = BASE_URL + "manual-invoices/update/"
export const DELETE_MANUAL_INVOICE = BASE_URL + "manual-invoices/delete/"
export const DOWNLOAD_MANUAL_INVOICE_PDF = BASE_URL + "manual-invoices/pdf/"
