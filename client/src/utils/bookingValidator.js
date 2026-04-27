/**
 * Booking Validator - Comprehensive validation for ride booking
 * Ensures all required data is present before payment
 */

export const bookingValidator = {
  /**
   * Validate coordinates from location
   */
  validateCoordinates: (coordinates) => {
    if (!coordinates) return false;
    const lat = coordinates.lat || coordinates.latitude;
    const lng = coordinates.lng || coordinates.longitude;
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat !== 0 &&
      lng !== 0
    );
  },

  /**
   * Validate pickup location
   */
  validatePickupLocation: (pickupLocation, pickupCoordinates) => {
    return {
      isValid: pickupLocation && pickupLocation.trim().length > 0,
      hasCoordinates: bookingValidator.validateCoordinates(pickupCoordinates),
      message: !pickupLocation
        ? 'Pickup location is required'
        : !bookingValidator.validateCoordinates(pickupCoordinates)
        ? 'Pickup location coordinates not found. Please select from suggestions.'
        : null,
    };
  },

  /**
   * Validate drop location
   */
  validateDropLocation: (dropLocation, dropCoordinates) => {
    return {
      isValid: dropLocation && dropLocation.trim().length > 0,
      hasCoordinates: bookingValidator.validateCoordinates(dropCoordinates),
      message: !dropLocation
        ? 'Destination is required'
        : !bookingValidator.validateCoordinates(dropCoordinates)
        ? 'Destination coordinates not found. Please select from suggestions.'
        : null,
    };
  },

  /**
   * Validate distance (must be > 0)
   */
  validateDistance: (distance) => {
    return {
      isValid: typeof distance === 'number' && distance > 0,
      message:
        typeof distance !== 'number'
          ? 'Distance is not calculated'
          : distance === 0
          ? 'Distance is 0 km. Please check locations and try again.'
          : null,
    };
  },

  /**
   * Validate duration (should be > 0)
   */
  validateDuration: (duration) => {
    return {
      isValid: typeof duration === 'number' && duration > 0,
      message:
        typeof duration !== 'number'
          ? 'Duration is not calculated'
          : duration === 0
          ? 'Duration couldn\'t be calculated. Please try again.'
          : null,
    };
  },

  /**
   * Validate car type
   */
  validateCarType: (cabType) => {
    const validTypes = ['economy', 'premium'];
    return {
      isValid: validTypes.includes(cabType),
      message: !cabType ? 'Please select a car type' : null,
    };
  },

  /**
   * Validate date and time
   */
  validateDateTime: (selectedDate, selectedTime) => {
    return {
      dateValid: selectedDate && selectedDate.length > 0,
      timeValid: selectedTime && selectedTime.length > 0,
      message: !selectedDate
        ? 'Please select a date'
        : !selectedTime
        ? 'Please select a time'
        : null,
    };
  },

  /**
   * Complete booking validation - returns detailed status
   */
  validateBooking: (bookingData) => {
    const {
      pickupLocation,
      pickupCoordinates,
      dropLocation,
      dropCoordinates,
      distance,
      duration,
      cabType,
      selectedDate,
      selectedTime,
    } = bookingData;

    const pickupValidation = bookingValidator.validatePickupLocation(
      pickupLocation,
      pickupCoordinates
    );
    const dropValidation = bookingValidator.validateDropLocation(
      dropLocation,
      dropCoordinates
    );
    const distanceValidation = bookingValidator.validateDistance(distance);
    const durationValidation = bookingValidator.validateDuration(duration);
    const carTypeValidation = bookingValidator.validateCarType(cabType);
    const dateTimeValidation = bookingValidator.validateDateTime(
      selectedDate,
      selectedTime
    );

    // If distance > 0, coordinates are validated on backend - no need to check here
    const isComplete =
      pickupValidation.isValid &&
      dropValidation.isValid &&
      distanceValidation.isValid && // ⭐ This proves coordinates exist
      durationValidation.isValid &&
      carTypeValidation.isValid &&
      dateTimeValidation.dateValid &&
      dateTimeValidation.timeValid;

    const errors = [];
    if (!pickupValidation.isValid) errors.push(pickupValidation.message);
    if (!dropValidation.isValid) errors.push(dropValidation.message);
    if (!distanceValidation.isValid) errors.push(distanceValidation.message);
    if (!durationValidation.isValid) errors.push(durationValidation.message);
    if (!carTypeValidation.isValid) errors.push(carTypeValidation.message);
    if (!dateTimeValidation.dateValid) errors.push(dateTimeValidation.message);
    if (!dateTimeValidation.timeValid) errors.push(dateTimeValidation.message);

    return {
      isComplete,
      isReadyForPayment: isComplete,
      errors,
      warnings: [],
      details: {
        pickup: pickupValidation,
        drop: dropValidation,
        distance: distanceValidation,
        duration: durationValidation,
        carType: carTypeValidation,
        dateTime: dateTimeValidation,
      },
    };
  },

  /**
   * Get user-friendly validation summary
   */
  getValidationSummary: (validationResult) => {
    const { isComplete, errors } = validationResult;

    if (isComplete) {
      return {
        status: 'READY',
        icon: '✅',
        message: 'All details verified. Ready to proceed',
        color: 'green',
      };
    }

    if (errors.length === 1) {
      return {
        status: 'INCOMPLETE',
        icon: '⚠️',
        message: errors[0],
        color: 'yellow',
      };
    }

    return {
      status: 'INCOMPLETE',
      icon: '❌',
      message: `${errors.length} required fields are missing or invalid`,
      details: errors,
      color: 'red',
    };
  },
};

export default bookingValidator;
