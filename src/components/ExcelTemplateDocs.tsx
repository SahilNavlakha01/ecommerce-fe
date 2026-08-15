"use client"

interface ExcelTemplateDocsProps {
  className?: string
}

export default function ExcelTemplateDocs({ className = "" }: ExcelTemplateDocsProps) {
  const requiredFields = [
    { field: 'name', description: 'Product name', example: 'Gold Diamond Ring' },
    { field: 'skuCode', description: 'Unique SKU code', example: 'GDR001' },
  ]

  const categoryFormat = [
    { format: 'FORMAT A', description: 'Top-level subcategory only', example: 'Anti-Tarnish' },
    { format: 'FORMAT B', description: 'Sub-subcategory using ">" separator', example: 'Anti-Tarnish > Rose Gold' },
    { format: 'FORMAT C', description: 'Multiple subcategories comma-separated', example: 'Anti-Tarnish > Rose Gold, Anti-Tarnish > Yellow Gold' },
    { format: 'FORMAT D', description: 'Mix of levels', example: 'Anti-Tarnish, Gold > 22KT' },
  ]

  const optionalFields = [
    { field: 'description', description: 'Product description', example: 'Beautiful gold ring with diamonds' },
    { field: 'basePrice', description: 'Base price (number)', example: '5000' },
    { field: 'b2bPrice', description: 'B2B price (number)', example: '4500' },
    { field: 'stockQuantity', description: 'Stock quantity (integer)', example: '10' },
    { field: 'purity', description: 'Purity value', example: '18K' },
    { field: 'weight', description: 'Weight (number)', example: '2.5' },
    { field: 'discountPrice', description: 'Discount price (number)', example: '4800' },
    { field: 'isB2b', description: 'B2B flag (true/false or 1/0)', example: '0' },
    { field: 'imageUrls', description: 'Comma-separated Google Drive URLs', example: 'https://drive.google.com/file/d/ABC123/view,https://drive.google.com/file/d/XYZ789/view' }
  ]

  const configFields = [
    { field: 'metalType', description: 'Metal Type config value', example: 'Gold' },
    { field: 'gender', description: 'Gender config value', example: 'Unisex' },
    { field: 'occasion', description: 'Occasion config value', example: 'Wedding' },
    { field: 'collectionName', description: 'Collection config value', example: 'Bridal' },
    { field: 'availabilityStatus', description: 'Availability config value', example: 'In Stock' },
    { field: 'sale', description: 'Sale config value', example: 'Regular' }
  ]

  const otherFields = [
    // { field: 'gemstoneType', description: 'Gemstone type', example: 'Diamond' },
    { field: 'certificationType', description: 'Certification type', example: 'GIA' },
    { field: 'size', description: 'Size (comma-separated for multiple)', example: '16,18,20,22' },
    { field: 'polishType', description: 'Polish type', example: 'High Polish' },
    { field: 'stoneSettingType', description: 'Stone setting type', example: 'Prong' },
    { field: 'origin', description: 'Origin', example: 'India' },
    { field: 'warranty', description: 'Warranty', example: '1 Year' }
  ]

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Excel Template Structure</h3>
      
      <div className="space-y-6">
        {/* Required Fields */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Required Fields
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requiredFields.map((field, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{field.field}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{field.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{field.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3-Level Category Format */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
            3-Level Category Columns (Row 1 = Category Name, Row 2 = "subcategory")
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Row 1 header = category name (e.g. <code className="bg-gray-100 px-1 rounded">Rings</code>). Row 2 sub-header = <code className="bg-gray-100 px-1 rounded">subcategory</code>. Data rows use one of these formats:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cell Value Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoryFormat.map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-semibold text-teal-700">{row.format}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.description}</td>
                    <td className="px-4 py-2 text-sm font-mono text-gray-500">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-800 mb-1">Example Excel Layout:</p>
            <pre className="text-xs text-blue-700 overflow-x-auto">{`Row 1: | (empty) | (empty)    | Rings                              | Necklace |
Row 2: | name    | skuCode    | subcategory                        | subcategory |
Row 3: | Ring 1  | SKU001     | Anti-Tarnish > Rose Gold           |  |
Row 4: | Ring 2  | SKU002     | Anti-Tarnish > Yellow Gold, Gold > 22KT |  |
Row 5: | Chain 1 | SKU003     |                                    | Long Chain > Thin |`}</pre>
          </div>
        </div>

        {/* Optional Fields */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Optional Fields
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {optionalFields.map((field, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{field.field}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{field.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{field.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuration Fields */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Configuration Fields
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            These fields use ConfigValue from ConfigMaster table. Use exact values as they appear in your system.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {configFields.map((field, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{field.field}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{field.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{field.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other Optional Fields */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Other Optional Fields
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {otherFields.map((field, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{field.field}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{field.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{field.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Column names are case-sensitive and must match exactly</li>
            <li>Category name in Row 1 must exactly match DB (case-insensitive)</li>
            <li>Use <strong>&gt;</strong> to separate subcategory from sub-subcategory (e.g. <code className="bg-yellow-100 px-1 rounded">Anti-Tarnish &gt; Rose Gold</code>)</li>
            <li>Multiple subcategories in one cell: comma-separated (e.g. <code className="bg-yellow-100 px-1 rounded">Anti-Tarnish &gt; Rose Gold, Gold &gt; 22KT</code>)</li>
            <li>If subcategory/sub-subcategory doesn't exist in DB, it will be auto-created</li>
            <li>Configuration fields must use exact ConfigValue strings</li>
            <li>Rows with missing required fields will be skipped</li>
            <li>Maximum file size: 10MB</li>
            <li>Recommended: Up to 1000 rows for optimal performance</li>
            <li>isB2b defaults to 0 (false) if not provided</li>
            <li>isActive is automatically set to 1 (true) for all products</li>
            <li>imageUrls: Use public Google Drive URLs separated by commas (no spaces)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}