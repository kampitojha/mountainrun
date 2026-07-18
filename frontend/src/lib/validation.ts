export type FieldErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const pincodePattern = /^[1-9][0-9]{5}$/;

export function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRegistrationForm(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = asString(formData.get("name"));
  const username = asString(formData.get("username"));
  const email = asString(formData.get("email"));
  const phone = asString(formData.get("phone")).replace(/\s+/g, "");
  const distance = asString(formData.get("distance"));
  const eventSlug = asString(formData.get("eventSlug"));
  const city = asString(formData.get("city"));
  const state = asString(formData.get("state"));
  const pincode = asString(formData.get("pincode"));
  const address = asString(formData.get("address"));

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

  if (!phonePattern.test(phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
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

  if (state.length < 2) {
    errors.state = "State is required.";
  }

  if (!pincodePattern.test(pincode)) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }

  if (address.length < 5) {
    errors.address = "Shipping address must be at least 5 characters.";
  }

  return errors;
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
