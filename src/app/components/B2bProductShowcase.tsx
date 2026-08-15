"use client"

import { useState, useEffect } from "react"
import { GetAllProducts } from "../../Services/GetService"
import ProductCard from "./ProductCard"
import { ProductGridSkeleton } from "../../components/ui/Skeleton"
import { getFirstImageUrl } from "../../utils/imageUtils"
import { filterInStockProducts } from "../../utils/productVisibility"

export default function B2bProductShowcase() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchB2bProducts()
    }, [])

    const fetchB2bProducts = async () => {
        try {
            // Fetch only B2B products
            const response = await GetAllProducts({ isB2b: true, limit: 4 })
            if (response?.data?.data?.products) {
                setProducts(response.data.data.products)
            }
        } catch (error) {
            console.error("Failed to fetch B2B products:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <ProductGridSkeleton count={4} />
                </div>
            </section>
        )
    }

    if (products.length === 0) {
        return null
    }

    return (
        <section className="bg-gray-50 py-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center mb-3">
                        <div className="h-px w-12 bg-teal-600/30"></div>
                        <span className="mx-4 text-teal-600 font-bold tracking-widest text-xs uppercase">B2B Exclusive</span>
                        <div className="h-px w-12 bg-teal-600/30"></div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
                        Our Business Collection
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base italic">
                        Wholesale jewelry designs with specialized B2B pricing for our business partners.
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={parseFloat(product.basePrice) - parseFloat(product.discountPrice || 0)}
                            oldPrice={product.discountPrice && parseFloat(product.discountPrice) > 0 ? product.basePrice : undefined}
                            discountPrice={product.discountPrice}
                            image={getFirstImageUrl(product) || "/images/placeholder.jpg"}
                            rating={product.avgRating || 0}
                            reviewCount={product.reviewCount || 0}
                            isB2b={product.isB2b || product.isBoth}
                            isBoth={product.isBoth}
                            b2bPrice={product.b2bPrice}
                            stockQuantity={product.stockQuantity || 0}
                            description={product.description}
                            forceB2bPrice={true}
                        />
                    ))}
                </div>

                {/* View All B2B CTA */}
                <div className="mt-12 text-center">
                    <a
                        href="/auth/register"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all duration-300 shadow-sm"
                    >
                        Register as Business Partner
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    )
}
