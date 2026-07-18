"use client";

import { useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import {
  PHONE_COUNTRIES,
  findPhoneCountry,
  formatFullPhone,
  parseStoredPhone,
} from "../../lib/phone-countries";
import { inputClass } from "./app-shell";

type PhoneInputProps = {
  defaultValue?: string;
  invalid?: boolean;
  name?: string;
};

export function PhoneInput({ defaultValue = "", invalid, name = "phone" }: PhoneInputProps) {
  const parsed = useMemo(() => parseStoredPhone(defaultValue), [defaultValue]);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(parsed.phoneNumber);

  const country = findPhoneCountry(countryCode);

  return (
    <div className="flex gap-2">
      <input name={name} type="hidden" value={formatFullPhone(countryCode, phoneNumber)} />
      <div className="relative shrink-0">
        <select
          aria-label="Country code"
          className={cn(inputClass, "w-[7.25rem] appearance-none pl-9 pr-7")}
          onChange={(event) => {
            const nextCountry = findPhoneCountry(event.target.value);
            setCountryCode(nextCountry.code);
            setPhoneNumber((current) => current.slice(0, nextCountry.maxLength));
          }}
          value={countryCode}
        >
          {PHONE_COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.flag} {item.dialCode}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-base leading-none">
          {country.flag}
        </span>
      </div>
      <input
        aria-invalid={invalid}
        aria-label="Phone number"
        className={cn(inputClass, "min-w-0 flex-1")}
        inputMode="numeric"
        maxLength={country.maxLength}
        name={`${name}Number`}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, country.maxLength);
          setPhoneNumber(digits);
        }}
        placeholder={country.placeholder}
        required
        type="tel"
        value={phoneNumber}
      />
      <input name={`${name}Country`} type="hidden" value={countryCode} />
    </div>
  );
}
