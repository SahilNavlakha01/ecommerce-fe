import {
    GET_ALL_PRODUCTS,
    GET_SINGLE_PRODUCT,
    GET_ALL_CATEGORIES,
    GET_SINGLE_CATEGORY,
    GET_ALL_SUBCATEGORIES,
    GET_ALL_BANNERS,
    GET_ACTIVE_BANNERS,
    GET_SUBCATEGORIES_BY_CATEGORY,
    GET_SUBCATEGORIES_BY_PARENT,
    GET_SINGLE_SUBCATEGORY,
    GET_PRODUCT_IMAGES,
    GET_CONFIG,
    GET_ALL_CONFIG,
    GET_ALL_USERS,
    GET_SINGLE_USER,
    GET_ALL_ORDERS,
    EXPORT_ORDERS,
    GET_USER_ORDERS,
    GET_ORDER_ITEMS,
    GET_ORDER_WITH_TRACKING,
    GET_DELIVERY_ESTIMATE,
    GET_STATES,
    FETCH_ADDRESSES,
    FETCH_CART,
    CART_ESTIMATION,
    FETCH_WISHLIST,
    GET_PRODUCT_REVIEWS,
    DOWNLOAD_BULK_TEMPLATE,
    CHECK_UPLOAD_STATUS,
    GET_UPLOADED_FILES,
    DOWNLOAD_UPLOADED_FILE,
    GET_DASHBOARD_STATS,
    GET_DASHBOARD_RECENT_ORDERS,
    GET_DASHBOARD_LOW_STOCK,
    GET_ALL_COUPONS,
    GET_ACTIVE_NEW_USER_COUPON,
    GET_ACTIVE_COUPONS,
    GET_ALL_MANUAL_INVOICES,
    GET_MANUAL_INVOICE,
    DOWNLOAD_MANUAL_INVOICE_PDF
} from "../Constant/Api";
import { get, post } from "./ApiMethod";
import { downloadFile } from "./ApiMethod";
import { optimizedApiCall } from "./OptimizedApiService.jsx";

// Product Services with optimized caching
export const GetAllProducts = async (filters = {}) => {
    // Build query parameters for isB2b and includeOutOfStock (backend checks req.query)
    const queryParams = new URLSearchParams();

    if (filters.hasOwnProperty('includeOutOfStock')) {
        queryParams.append('includeOutOfStock', filters.includeOutOfStock.toString());
    }

    // Check if this is an admin request with explicit isB2b filter
    if (filters.hasOwnProperty('isB2b')) {
        queryParams.append('isB2b', filters.isB2b.toString());
    } else {
        // Check if user is B2B customer (userRole = 2) for regular user requests
        const userData = document.cookie
            .split('; ')
            .find(row => row.startsWith('userData='))
            ?.split('=')[1];

        let isB2bUser = false;
        if (userData) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(userData));
                isB2bUser = parsedData.userRole === 2;
                queryParams.set('isB2b', isB2bUser ? 'true' : 'false');
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        } else {
            // Default to retail filter if no user data found
            queryParams.set('isB2b', 'false');
        }
    }

    const queryString = queryParams.toString();
    const url = GET_ALL_PRODUCTS + (queryString ? `?${queryString}` : '');

    // Send ALL filters in body as backend expects req.body
    return post(url, filters);
}

export const GetSingleProduct = async (id) => {
    const url = GET_SINGLE_PRODUCT + `${id}`;
    return optimizedApiCall(() => get(url), url);
}

// Category Services
export const GetAllCategories = async () => {
    return optimizedApiCall(() => get(GET_ALL_CATEGORIES), GET_ALL_CATEGORIES);
}

export const GetSingleCategory = async (id) => {
    return get(GET_SINGLE_CATEGORY + `${id}`);
}

// Subcategory Services
export const GetAllSubcategories = async () => {
    return get(GET_ALL_SUBCATEGORIES);
}

export const GetSubcategoriesByCategory = async (categoryId) => {
    return get(GET_SUBCATEGORIES_BY_CATEGORY + `${categoryId}`);
}

export const GetSubcategoriesByParent = async (parentId) => {
    return get(GET_SUBCATEGORIES_BY_PARENT + `${parentId}`);
}

export const GetSingleSubcategory = async (id) => {
    return get(GET_SINGLE_SUBCATEGORY + `${id}`);
}

// User Services
export const GetAllUsers = async () => {
    return get(GET_ALL_USERS);
}

export const GetSingleUser = async (userId) => {
    return get(GET_SINGLE_USER + `${userId}`);
}

// Order Services
export const GetAllOrders = async () => {
    return get(GET_ALL_ORDERS);
}

export const GetOrdersExport = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(EXPORT_ORDERS + (query ? `?${query}` : ''));
}

export const GetUserOrders = async (userId) => {
    return get(GET_USER_ORDERS + `${userId}`);
}

export const GetOrderItems = async (orderId) => {
    return get(GET_ORDER_ITEMS + `${orderId}`);
}

export const GetOrderWithTracking = async (orderId, userId) => {
    return get(GET_ORDER_WITH_TRACKING + `${orderId}/${userId}`);
}

export const GetDeliveryEstimate = async (deliveryPin, weight = 0.5) => {
    return get(`${GET_DELIVERY_ESTIMATE}?delivery_pincode=${deliveryPin}&weight=${weight}`);
}

// Product Images Services
export const GetProductImages = async (productId) => {
    return get(GET_PRODUCT_IMAGES + `${productId}`);
}

export const GetConfig = async (configName) => {
    return optimizedApiCall(
        (params) => post(GET_CONFIG, params),
        GET_CONFIG,
        { ConfigName: configName }
    );
};

export const GetAllConfig = async () => {
    return optimizedApiCall(() => get(GET_ALL_CONFIG), GET_ALL_CONFIG);
};

export const GetStates = async () => {
    return get(GET_STATES);
};

// Address Services
export const FetchAddresses = async (userId) => {
    return get(`${FETCH_ADDRESSES}?userId=${userId}`);
};

// Cart Services - No caching for user-specific data
export const FetchCart = async (userId) => {
    return get(FETCH_CART + `${userId}`);
};

export const GetCartEstimation = async (userId, deliveryPincode) => {
    const url = deliveryPincode
        ? `${CART_ESTIMATION}${userId}?delivery_pincode=${deliveryPincode}`
        : `${CART_ESTIMATION}${userId}`;
    return get(url);
};

// Wishlist Services - No caching for user-specific data
export const FetchWishlist = async (userId) => {
    return get(FETCH_WISHLIST + `${userId}`);
};

// Review Services
export const GetProductReviews = async (productId) => {
    return get(GET_PRODUCT_REVIEWS + `${productId}`);
};

// Legacy function - now uses optimized caching
export const GetCategoriesWithCache = async () => {
    return GetAllCategories();
}

// Banner Services
export const GetAllBanners = async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", String(params.page));
    if (params.limit) queryParams.set("limit", String(params.limit));
    const queryString = queryParams.toString();
    return get(GET_ALL_BANNERS + (queryString ? `?${queryString}` : ""));
}

export const GetActiveBanners = async () => {
    return optimizedApiCall(() => get(GET_ACTIVE_BANNERS), GET_ACTIVE_BANNERS);
}

// Bulk Upload Services
export const DownloadBulkTemplate = async () => {
    return downloadFile(DOWNLOAD_BULK_TEMPLATE);
};

export const CheckUploadStatus = async (fileLogId) => {
    return get(CHECK_UPLOAD_STATUS + fileLogId);
};

export const GetUploadedFiles = async () => {
    return get(GET_UPLOADED_FILES);
};

export const DownloadUploadedFile = async (fileId) => {
    return downloadFile(DOWNLOAD_UPLOADED_FILE + fileId);
};

// Dashboard Services
export const GetDashboardStats = async () => {
    return get(GET_DASHBOARD_STATS);
};

export const GetDashboardRecentOrders = async () => {
    return get(GET_DASHBOARD_RECENT_ORDERS);
};

export const GetDashboardLowStock = async () => {
    return get(GET_DASHBOARD_LOW_STOCK);
};

// Coupon Services
export const GetAllCoupons = async () => {
    return get(GET_ALL_COUPONS);
};

export const GetActiveCoupons = async (userType) => {
    const url = userType ? `${GET_ACTIVE_COUPONS}?userType=${userType}` : GET_ACTIVE_COUPONS;
    return get(url);
};

export const GetActiveNewUserCoupon = async () => {
    return get(GET_ACTIVE_NEW_USER_COUPON);
};

// Manual Invoice Services
export const GetAllManualInvoices = async () => {
    return get(GET_ALL_MANUAL_INVOICES);
};

export const GetManualInvoice = async (id) => {
    return get(GET_MANUAL_INVOICE + id);
};

export const DownloadManualInvoicePDF = async (id) => {
    return get(DOWNLOAD_MANUAL_INVOICE_PDF + id);
};