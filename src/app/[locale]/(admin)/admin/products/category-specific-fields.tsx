"use client";

import { useState } from "react";

type ProductCategory =
  | "phones"
  | "audio"
  | "computing"
  | "wearables"
  | "accessories"
  | "skincare"
  | "shoes";

type CategorySpecificFieldsProps = {
  initialCategory?: string;
  initialCondition?: "certified_pre_owned" | "new";
  initialColor?: string;
  initialStorage?: string;
  initialBatteryHealth?: string;
  initialImei?: string;
  initialGradingData?: string;
  initialCompatibility?: string;
  initialMaterial?: string;
  initialRam?: string;
  initialProcessor?: string;
  initialSizeVolume?: string;
  initialSkinType?: string;
  initialIngredients?: string;
  initialExpirationDate?: string;
  initialShoeSize?: string;
  initialGenderFit?: string;
};

const categories: Array<{ value: ProductCategory; label: string }> = [
  { value: "phones", label: "Phones" },
  { value: "audio", label: "Audio" },
  { value: "computing", label: "Computing" },
  { value: "wearables", label: "Wearables" },
  { value: "accessories", label: "Accessories" },
  { value: "skincare", label: "Skincare" },
  { value: "shoes", label: "Shoes" },
];

const storageOptions = [
  { value: "", label: "Select storage" },
  { value: "32", label: "32GB" },
  { value: "64", label: "64GB" },
  { value: "128", label: "128GB" },
  { value: "256", label: "256GB" },
  { value: "512", label: "512GB" },
  { value: "1024", label: "1TB" },
  { value: "2048", label: "2TB" },
];

const gradeOptions = ["Grade A", "Grade B", "Grade C"];
const batteryOptions = Array.from({ length: 11 }, (_, index) => 100 - index * 5);
const inputClassName =
  "w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400";
const labelClassName = "mb-2 block text-xs font-black uppercase tracking-widest text-gray-500";

function TextField({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClassName}>{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue || ""}
        className={inputClassName}
        placeholder={placeholder}
      />
    </label>
  );
}

function ProductCondition({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="block">
      <span className={labelClassName}>Product Condition</span>
      <select
        name="productCondition"
        defaultValue={defaultValue || "new"}
        className={inputClassName}
      >
        <option value="new">New</option>
        <option value="certified_pre_owned">Certified Pre-Owned</option>
      </select>
    </label>
  );
}

function Storage({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="block">
      <span className={labelClassName}>Storage</span>
      <select name="storage" defaultValue={defaultValue || ""} className={inputClassName}>
        {storageOptions.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BatteryHealth({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="block">
      <span className={labelClassName}>Battery Health</span>
      <select name="batteryHealth" defaultValue={defaultValue || ""} className={inputClassName}>
        <option value="">Select battery health</option>
        {batteryOptions.map((option) => (
          <option key={option} value={option}>
            {option}%
          </option>
        ))}
      </select>
    </label>
  );
}

function Grading({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="block">
      <span className={labelClassName}>Grading</span>
      <select name="gradingData" defaultValue={defaultValue || ""} className={inputClassName}>
        <option value="">Select grade</option>
        {gradeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CategorySpecificFields({
  initialCategory = "phones",
  initialCondition = "new",
  initialColor = "",
  initialStorage = "",
  initialBatteryHealth = "",
  initialImei = "",
  initialGradingData = "",
  initialCompatibility = "",
  initialMaterial = "",
  initialRam = "",
  initialProcessor = "",
  initialSizeVolume = "",
  initialSkinType = "",
  initialIngredients = "",
  initialExpirationDate = "",
  initialShoeSize = "",
  initialGenderFit = "",
}: CategorySpecificFieldsProps) {
  const [category, setCategory] = useState<ProductCategory>(
    categories.some((option) => option.value === initialCategory)
      ? (initialCategory as ProductCategory)
      : "phones",
  );
  const conditionField = <ProductCondition defaultValue={initialCondition} />;
  const colorField = (
    <TextField
      label="Color"
      name="color"
      defaultValue={initialColor}
      placeholder="Midnight Black"
    />
  );
  const gradingField = <Grading defaultValue={initialGradingData} />;

  return (
    <>
      <label className="block">
        <span className={labelClassName}>Product Category</span>
        <select
          name="collectionId"
          value={category}
          onChange={(event) => setCategory(event.target.value as ProductCategory)}
          className={inputClassName}
        >
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {category === "phones" ? (
        <>
          {conditionField}
          {colorField}
          <Storage defaultValue={initialStorage} />
          <BatteryHealth defaultValue={initialBatteryHealth} />
          <TextField
            label="IMEI"
            name="imei"
            defaultValue={initialImei}
            placeholder="357123456789012"
          />
          {gradingField}
        </>
      ) : null}

      {category === "audio" ? (
        <>
          {conditionField}
          {colorField}
          <BatteryHealth defaultValue={initialBatteryHealth} />
          <TextField
            label="Compatibility"
            name="compatibility"
            defaultValue={initialCompatibility}
            placeholder="Bluetooth, iOS, Android"
          />
          {gradingField}
        </>
      ) : null}

      {category === "computing" ? (
        <>
          {conditionField}
          {colorField}
          <Storage defaultValue={initialStorage} />
          <TextField label="RAM" name="ram" defaultValue={initialRam} placeholder="16GB" />
          <TextField
            label="Processor"
            name="processor"
            defaultValue={initialProcessor}
            placeholder="Apple M2, Intel i7"
          />
          <TextField
            label="Compatibility"
            name="compatibility"
            defaultValue={initialCompatibility}
            placeholder="USB-C, Windows, macOS"
          />
          {gradingField}
        </>
      ) : null}

      {category === "wearables" ? (
        <>
          {conditionField}
          {colorField}
          <BatteryHealth defaultValue={initialBatteryHealth} />
          <TextField
            label="Compatibility"
            name="compatibility"
            defaultValue={initialCompatibility}
            placeholder="iPhone, Android"
          />
          <TextField
            label="Material"
            name="material"
            defaultValue={initialMaterial}
            placeholder="Aluminum, silicone band"
          />
          {gradingField}
        </>
      ) : null}

      {category === "accessories" ? (
        <>
          {conditionField}
          {colorField}
          <TextField
            label="Compatibility"
            name="compatibility"
            defaultValue={initialCompatibility}
            placeholder="iPhone 15, USB-C devices"
          />
          <TextField
            label="Material"
            name="material"
            defaultValue={initialMaterial}
            placeholder="Leather, silicone, braided cable"
          />
        </>
      ) : null}

      {category === "skincare" ? (
        <>
          <TextField
            label="Size / Volume"
            name="sizeVolume"
            defaultValue={initialSizeVolume}
            placeholder="50ml, 100ml, 1.7oz"
          />
          <TextField
            label="Skin Type"
            name="skinType"
            defaultValue={initialSkinType}
            placeholder="Dry, oily, sensitive, all skin types"
          />
          <TextField
            label="Ingredients"
            name="ingredients"
            defaultValue={initialIngredients}
            placeholder="Hyaluronic acid, niacinamide"
          />
          <TextField
            label="Expiration Date"
            name="expirationDate"
            defaultValue={initialExpirationDate}
            placeholder="2027-12"
          />
        </>
      ) : null}

      {category === "shoes" ? (
        <>
          {conditionField}
          {colorField}
          <TextField
            label="Shoe Size"
            name="shoeSize"
            defaultValue={initialShoeSize}
            placeholder="US 9, EU 42, 270mm"
          />
          <TextField
            label="Material"
            name="material"
            defaultValue={initialMaterial}
            placeholder="Leather, mesh, suede"
          />
          <TextField
            label="Fit"
            name="genderFit"
            defaultValue={initialGenderFit}
            placeholder="Men, women, unisex"
          />
          {gradingField}
        </>
      ) : null}
    </>
  );
}
