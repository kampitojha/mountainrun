import { validatePhoneFields } from "./phone-countries";
import { isIndianState } from "./indian-states";

export type FieldErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pincodePattern = /^[1-9][0-9]{5}$/;

export function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRegistrationForm(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = asString(formData.get("name"));
  const username = asString(formData.get("username"));
  const email = asString(formData.get("email"));
  const distance = asString(formData.get("distance"));
  const eventSlug = asString(formData.get("eventSlug"));
  const city = asString(formData.get("city"));
  const state = asString(formData.get("state"));
  const pincode = asString(formData.get("pincode"));
  const address = asString(formData.get("address"));
  const landmark = asString(formData.get("landmark"));

  if (name.length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

  if (username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = "Username can only contain alphanumeric characters and underscores.";
  }

  if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const phoneError = validatePhoneFields(formData);
  if (phoneError) {
    errors.phone = phoneError;
  }

  if (!distance) {
    errors.distance = "Select a distance.";
  }

  if (!eventSlug) {
    errors.eventSlug = "Select an event.";
  }

  if (city.length < 2) {
    errors.city = "City is required.";
  }

  if (!state) {
    errors.state = "Select a state.";
  } else if (!isIndianState(state)) {
    errors.state = "Choose a valid Indian state from the list.";
  }

  if (!pincodePattern.test(pincode)) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }

  if (address.length < 5) {
    errors.address = "Shipping address must be at least 5 characters.";
  }

  if (landmark.length > 120) {
    errors.landmark = "Landmark must be 120 characters or fewer.";
  }

  return errors;
}

export function getValidationSummaryMessage(errors: FieldErrors) {
  const messages = Object.values(errors).filter(Boolean);

  if (messages.length === 0) {
    return "";
  }

  if (messages.length === 1) {
    return messages[0];
  }

  return `Please review the ${messages.length} highlighted fields below before continuing to payment.`;
}

export function validateAdminEventForm(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const title = asString(formData.get("title"));
  const distances = asString(formData.get("distances"));
  const price = asString(formData.get("price"));

  if (title.length < 3) {
    errors.title = "Event title must be at least 3 characters.";
  }

  if (!distances || !distances.split(",").some((part) => part.trim().length > 0)) {
    errors.distances = "Add at least one distance (e.g. 5 km, 10 km).";
  }

  const priceNumber = Number(price);
  if (!price || Number.isNaN(priceNumber) || priceNumber < 1) {
    errors.price = "Enter a valid price in rupees (minimum 1).";
  }

  return errors;
}

export function validateDemoProofForm(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = asString(formData.get("name"));
  const distance = asString(formData.get("distance"));
  const address = asString(formData.get("address"));
  const proof = formData.get("proof") as File | null;

  if (name.length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

  if (!distance) {
    errors.distance = "Select a distance.";
  }

  if (address.length < 5) {
    errors.address = "Shipping address must be at least 5 characters.";
  }

  if (!proof || proof.size === 0) {
    errors.proof = "Please upload a GPS activity proof file.";
  }

  return errors;
}
