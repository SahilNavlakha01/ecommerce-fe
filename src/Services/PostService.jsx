import {
    REGISTER_USER,
    LOGIN_USER,
    LOGIN_ADMIN,
    REGISTER_USER_AUTH,
    REGISTER_B2B_USER,
    REGISTER_WITH_PHONE,
    CHECK_PHONE,
    ADD_PRODUCT,
    ADD_PRODUCT_WITH_IMAGES,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_WITH_IMAGES,
    DELETE_PRODUCT,
    UPDATE_STOCK,
    UPDATE_TOP_PRODUCTS,
    ADD_CATEGORY,
    UPDATE_CATEGORY,
    DELETE_CATEGORY,
    ADD_BANNER,
    UPDATE_BANNER,
    DELETE_BANNER,
    UPDATE_BANNER_ORDER,
    ADD_SUBCATEGORY,
    UPDATE_SUBCATEGORY,
    DELETE_SUBCATEGORY,
    UPLOAD_PRODUCT_IMAGES,
    DELETE_PRODUCT_IMAGE,
    ADD_CONFIG,
    UPDATE_CONFIG,
    DELETE_CONFIG,
    UPDATE_USER,
    RESET_PASSWORD,
    SEND_OTP_PASSWORD_RESET,
    RESET_PASSWORD_WITH_OTP,
    SEND_OTP,
    VERIFY_OTP,
    VERIFY_CONTACT_CHECKOUT,
    VERIFY_EMAIL_CHECKOUT,
    FETCH_ADDRESSES,
    FETCH_ONE_ADDRESS,
    ADD_ADDRESS,
    UPDATE_ADDRESS,
    DELETE_ADDRESS,
    ADD_TO_CART,
    UPDATE_CART_QUANTITY,
    DELETE_CART_ITEM,
    CLEAR_CART,
    CLEAR_USER_CART,
    CLEAR_ALL_CARTS,
    REMOVE_USER_CART_ITEMS,
    CHECKOUT_ORDER,
    CREATE_RAZORPAY_ORDER,
    VERIFY_PAYMENT,
    UPDATE_ORDER_STATUS,
    APPLY_COUPON,
    ADD_TO_WISHLIST,
    REMOVE_FROM_WISHLIST,
    ADD_REVIEW,
    DELETE_REVIEW,
    BULK_UPLOAD_PRODUCTS,
    DELETE_UPLOADED_FILE,
    CANCEL_PAYMENT,
    SEND_CONTACT_EMAIL,
    CREATE_COD_CHARGE_ORDER,
    ADD_COUPON,
    UPDATE_COUPON,
    DELETE_COUPON,
    CREATE_MANUAL_INVOICE,
    UPDATE_MANUAL_INVOICE,
    DELETE_MANUAL_INVOICE
} from "../Constant/Api";

import { post, put, deleteRequest, postFormData, get } from "./ApiMethod";
import { invalidateCache } from "./OptimizedApiService.jsx";

// User Services
export const RegisterUser = async (params) => {
    // params: { name, email, phone, passwordHash, userRole, companyName, gstNumber, createdBy }
    return post(REGISTER_USER, params);
};

export const LoginUser = async (params) => {
    // params: { email, password }
    return post(LOGIN_USER, params);
};

export const LoginAdmin = async (params) => {
    // params: { email, password }
    return post(LOGIN_ADMIN, params);
};

export const LoginUserAuth = async (params) => {
    // params: { email, password }
    return post(LOGIN_ADMIN, params);
};

export const RegisterUserAuth = async (params) => {
    if (params instanceof FormData) {
        return postFormData(REGISTER_USER_AUTH, params);
    }
    return post(REGISTER_USER_AUTH, params);
};

export const RegisterB2BUser = async (params) => {
    if (params instanceof FormData) {
        return postFormData(REGISTER_B2B_USER, params);
    }
    return post(REGISTER_B2B_USER, params);
};

export const RegisterWithPhone = async (params) => {
    return post(REGISTER_WITH_PHONE, params);
};

export const CheckPhone = async (params) => {
    // params: { phone }
    return post(CHECK_PHONE, params);
};

// Product Services
export const AddProduct = async (params) => {
    // params: { name, description, basePrice, b2bPrice, stockQuantity, skuCode, purity, weight, discountPrice, subcategoryId, createdBy }
    const result = await post(ADD_PRODUCT, params);
    clearRelatedCache('product');
    return result;
};

export const UpdateProduct = async (params, id) => {
    // params: { name, description, basePrice, b2bPrice, stockQuantity, skuCode, discountPrice, purity, weight, subcategoryId, updatedBy, isActive }
    const result = await post(UPDATE_PRODUCT + `${id}`, params);
    clearRelatedCache('product');
    return result;
};

export const DeleteProduct = async (id) => {
    const result = await post(DELETE_PRODUCT + `${id}`);
    clearRelatedCache('product');
    return result;
};

export const UpdateStock = async (id, stockQuantity) => {
    const result = await post(UPDATE_STOCK + `${id}`, { stockQuantity });
    clearRelatedCache('product');
    return result;
};

export const UpdateTopProducts = async (topProducts) => {
    const result = await put(UPDATE_TOP_PRODUCTS, { topProducts });
    clearRelatedCache('product');
    return result;
};

// New Product with Images Services
export const AddProductWithImages = async (formData) => {
    return postFormData(ADD_PRODUCT_WITH_IMAGES, formData);
};

export const UpdateProductWithImages = async (formData, id) => {
    return postFormData(UPDATE_PRODUCT_WITH_IMAGES + `${id}`, formData);
};

// Category Services
export const AddCategory = async (params) => {
    return post(ADD_CATEGORY, params);
};

export const UpdateCategory = async (params, id) => {
    return post(UPDATE_CATEGORY + `${id}`, params);
};

export const DeleteCategory = async (id) => {
    return post(DELETE_CATEGORY + `${id}`, {});
};

// Banner Services
export const AddBanner = async (formData) => {
    return postFormData(ADD_BANNER, formData);
};

export const UpdateBanner = async (formData, id) => {
    return postFormData(UPDATE_BANNER + `${id}`, formData);
};

export const DeleteBanner = async (id) => {
    return post(DELETE_BANNER + `${id}`, {});
};

export const UpdateBannerOrder = async (orderedBanners) => {
    return put(UPDATE_BANNER_ORDER, { orderedBanners });
};

// Product Images Services
export const UploadProductImages = async (formData) => {
    // formData should contain the image files and product_id
    return postFormData(UPLOAD_PRODUCT_IMAGES, formData);
};

export const DeleteProductImage = async (id) => {
    return post(DELETE_PRODUCT_IMAGE + `${id}`);
};

// Clear cache when data is modified
const clearRelatedCache = (entity) => {
    switch (entity) {
        case 'category':
            invalidateCache('categories');
            localStorage.removeItem('categories_cache');
            localStorage.removeItem('categories_cache_time');
            break;
        case 'product':
            invalidateCache('products');
            break;
        case 'config':
            invalidateCache('config');
            break;
        case 'review':
            invalidateCache('review');
            break;
        default:
            break;
    }
};

// Enhanced service functions with cache clearing
export const AddCategoryWithCache = async (params) => {
    const result = await AddCategory(params);
    clearRelatedCache('category');
    return result;
};

export const UpdateCategoryWithCache = async (params, id) => {
    const result = await UpdateCategory(params, id);
    clearRelatedCache('category');
    return result;
};

export const DeleteCategoryWithCache = async (id) => {
    const result = await DeleteCategory(id);
    clearRelatedCache('category');
    return result;
};

// Subcategory Services
export const AddSubcategory = async (params) => {
    return post(ADD_SUBCATEGORY, params);
};

export const UpdateSubcategory = async (params, id) => {
    return post(UPDATE_SUBCATEGORY + `${id}`, params);
};

export const DeleteSubcategory = async (id) => {
    return post(DELETE_SUBCATEGORY + `${id}`, {});
};

// Config Services
export const AddConfig = async (params) => {
    const result = await post(ADD_CONFIG, params);
    clearRelatedCache('config');
    return result;
};

export const UpdateConfig = async (params, id) => {
    const result = await put(UPDATE_CONFIG + `${id}`, params);
    clearRelatedCache('config');
    return result;
};

export const DeleteConfig = async (id) => {
    const result = await deleteRequest(DELETE_CONFIG + `${id}`);
    clearRelatedCache('config');
    return result;
};

// User Update Services
export const UpdateUser = async (params, id) => {
    return put(UPDATE_USER + `${id}`, params);
};

export const ResetPassword = async (params, id) => {
    return put(RESET_PASSWORD + `${id}/reset-password`, params);
};

export const ClearUserCart = async (userId) => {
    return post(CLEAR_USER_CART + `${userId}`, {});
};

export const ClearAllActiveCarts = async () => {
    return post(CLEAR_ALL_CARTS, {});
};

export const RemoveUserCartItems = async (userId, cartItemIds) => {
    return post(REMOVE_USER_CART_ITEMS + userId, { cartItemIds });
};

// Password Reset with OTP Services
export const SendOtpPasswordReset = async (params) => {
    // params: { contactType: "email", contactValue: "user@example.com", userId?: number }
    return post(SEND_OTP_PASSWORD_RESET, params);
};

export const ResetPasswordWithOtp = async (params) => {
    // params: { email: "string", newPassword: "string", otpCode: "string" }
    return post(RESET_PASSWORD_WITH_OTP, params);
};

// OTP Services for Login/Register
export const SendOtp = async (params) => {
    // params: { contactType: "mobile", contactValue: "+919876543210", isLoginAuth: true }
    return post(SEND_OTP, params);
};

export const VerifyOtp = async (params) => {
    // params: { contactType: "mobile", contactValue: "+919876543210", otpCode: "123456", isLoginAuth: true }
    return post(VERIFY_OTP, params);
};

// Verification Checkout Services
export const VerifyContactCheckout = async (params) => {
    // params: { userId: "123" }
    return post(VERIFY_CONTACT_CHECKOUT, params);
};

export const VerifyEmailCheckout = async (params) => {
    // params: { userId: "123" }
    return post(VERIFY_EMAIL_CHECKOUT, params);
};

// Address Services
export const FetchAddresses = async (userId) => {
    return get(`${FETCH_ADDRESSES}${userId ? `?userId=${userId}` : ''}`);
};

export const FetchOneAddress = async (id) => {
    return get(`${FETCH_ONE_ADDRESS}${id}`);
};

export const AddAddress = async (params) => {
    return post(ADD_ADDRESS, params);
};

export const UpdateAddress = async (params, id) => {
    return put(`${UPDATE_ADDRESS}${id}`, params);
};

export const DeleteAddress = async (id, updatedBy) => {
    return deleteRequest(`${DELETE_ADDRESS}${id}`, { updatedBy });
};

// Cart Services
export const AddToCart = async (params) => {
    // params: { userId, sessionId, productId, quantity } - price is now auto-calculated
    return post(ADD_TO_CART, params);
};

export const UpdateCartQuantity = async (params) => {
    // params: { cartItemId, quantity, userId }
    return post(UPDATE_CART_QUANTITY, params);
};

export const DeleteCartItem = async (id) => {
    return post(DELETE_CART_ITEM + `${id}`);
};

export const ClearCart = async (cartId) => {
    return post(CLEAR_CART + `${cartId}`);
};

// Order Services
export const CheckoutOrder = async (params) => {
    // params: { userId, cartId, paymentMethod, addressId, orderNotes, couponCode }
    return post(CHECKOUT_ORDER, params);
};

export const CreateRazorpayOrder = async (params) => {
    // params: { amount, currency, orderId }
    return post(CREATE_RAZORPAY_ORDER, params);
};

export const VerifyPayment = async (params) => {
    // params: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
    return post(VERIFY_PAYMENT, params);
};

export const UpdateOrderStatus = async (orderId, params) => {
    // params: { status, updatedBy }
    return post(UPDATE_ORDER_STATUS + orderId, params);
};

export const ApplyCoupon = async (params) => {
    // params: { couponCode, userId, cartTotal }
    return post(APPLY_COUPON, params);
};

export const CancelPayment = async (params) => {
    // params: { orderId, userId }
    return post(CANCEL_PAYMENT, params);
};

export const CreateCodChargeOrder = async (params) => {
    // params: { userId }
    return post(CREATE_COD_CHARGE_ORDER, params);
};

// Wishlist Services
export const AddToWishlist = async (params) => {
    // params: { userId, productId }
    return post(ADD_TO_WISHLIST, params);
};

export const RemoveFromWishlist = async (params) => {
    // params: { userId, productId }
    return post(REMOVE_FROM_WISHLIST, params);
};

// Review Services
export const AddReview = async (params) => {
    // params: { productId, userId, rating, reviewText }
    const result = await post(ADD_REVIEW, params);
    clearRelatedCache('review');
    return result;
};

export const DeleteReview = async (params) => {
    // params: { id, userId }
    const result = await post(DELETE_REVIEW, params);
    clearRelatedCache('review');
    return result;
};

// Bulk Upload Services
export const BulkUploadProducts = async (formData) => {
    // formData should contain excelFile and createdBy
    const result = await postFormData(BULK_UPLOAD_PRODUCTS, formData, 300000);
    clearRelatedCache('product');
    return result;
};

export const BulkUploadBatch = async (formData) => {
    // Optimized batch upload with timeout
    const result = await postFormData(BULK_UPLOAD_PRODUCTS, formData, 300000);
    clearRelatedCache('product');
    return result;
};

export const DeleteUploadedFile = async (fileId) => {
    const result = await deleteRequest(DELETE_UPLOADED_FILE + fileId);
    clearRelatedCache('product');
    return result;
};

// Contact Services
export const SendContactEmail = async (params) => {
    // params: { name, email, subject, message }
    return post(SEND_CONTACT_EMAIL, params);
};

// Coupon Services
export const AddCoupon = async (params) => {
    return post(ADD_COUPON, params);
};

export const UpdateCoupon = async (params, id) => {
    return post(UPDATE_COUPON + `${id}`, params);
};

export const DeleteCoupon = async (id) => {
    return post(DELETE_COUPON + `${id}`, {});
};

// Manual Invoice Services
export const CreateManualInvoice = async (params) => {
    return post(CREATE_MANUAL_INVOICE, params);
};

export const UpdateManualInvoice = async (params, id) => {
    return post(UPDATE_MANUAL_INVOICE + `${id}`, params);
};

export const DeleteManualInvoice = async (id) => {
    return deleteRequest(DELETE_MANUAL_INVOICE + `${id}`);
};