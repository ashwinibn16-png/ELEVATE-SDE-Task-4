import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Search, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Building2,
  AlertCircle
} from 'lucide-react';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { INDIAN_STATES, UNION_TERRITORIES } from '../data/indianStates';
import { submitApplication } from '../services/api';

export default function RequestCertificate() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    city: '',
    state: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Submission success state
  const [submittedApp, setSubmittedApp] = useState(null);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for field once user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Indian phone number validator (10 digits, allows optional +91 or leading 0)
  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
      return 'Phone number is required.';
    }
    // Remove all whitespace, dashes, parens
    const cleaned = phone.replace(/[\s\-()]/g, '');
    // Check if format matches optional +91 or 91 followed by 10 digits starting with 6-9, or directly 10 digits
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleaned)) {
      return 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210 or +91 9876543210).';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name: required, not only whitespace, minimum 2 characters
    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    // Phone Number validation
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) {
      newErrors.phone = phoneErr;
    }

    // Gender: must be selected
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender.';
    }

    // City: required, not only whitespace
    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    // State: required
    if (!formData.state || !formData.state.trim()) {
      newErrors.state = 'Please select a State or Union Territory.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const newApp = await submitApplication(formData);
      setSubmittedApp(newApp);
    } catch (err) {
      console.error('Error creating application:', err);
      setSubmitError(err.message || 'Failed to submit application. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      gender: '',
      city: '',
      state: '',
    });
    setErrors({});
    setSubmitError('');
    setSubmittedApp(null);
  };

  const handleTrackNavigation = () => {
    if (submittedApp) {
      navigate('/track', { state: { applicationId: submittedApp.id } });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold border border-navy-200">
          <FileText className="w-3.5 h-3.5 text-teal-600" />
          <span>Citizen Application Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Request Certificate
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Please fill in the official applicant details below. All fields are required. 
          Upon submission, you will receive a unique Application ID to monitor your approval status.
        </p>
      </div>

      {/* Success State Screen */}
      {submittedApp ? (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-8 sm:p-10 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-navy-900">
              Application submitted successfully!
            </h2>
            <p className="text-sm text-slate-600">
              Your certificate request has been registered in the digital ledger and assigned to the review queue.
            </p>
          </div>

          {/* Generated Application ID Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-md mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your Generated Application ID
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-extrabold text-navy-900 tracking-wider">
                {submittedApp.id}
              </span>
            </div>
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span>Submitted on: {new Date(submittedApp.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Status: Pending
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="teal"
              size="lg"
              onClick={handleTrackNavigation}
              rightIcon={Search}
              className="w-full sm:w-auto"
            >
              Track This Application
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleResetForm}
              leftIcon={RotateCcw}
              className="w-full sm:w-auto"
            >
              Submit Another Application
            </Button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6">
          {submitError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Submission Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Full Name */}
            <FormField
              label="Full Name"
              id="fullName"
              name="fullName"
              required
              error={errors.fullName}
              hint="As per official photo ID"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-500'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-navy-800'
                  }`}
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                />
              </div>
            </FormField>

            {/* Phone Number */}
            <FormField
              label="Phone Number"
              id="phone"
              name="phone"
              required
              error={errors.phone}
              hint="10-digit Indian mobile number"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210 or +91 9876543210"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-500'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-navy-800'
                  }`}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                />
              </div>
            </FormField>

            {/* Gender Radio Buttons */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Gender <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Male', 'Female', 'Other'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                      formData.gender === option
                        ? 'border-navy-800 bg-navy-50 text-navy-900 ring-2 ring-navy-800'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={handleChange}
                      className="w-4 h-4 text-navy-800 focus:ring-navy-800"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-xs text-rose-600 font-medium mt-1">
                  {errors.gender}
                </p>
              )}
            </div>

            {/* City & State Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* City */}
              <FormField
                label="City"
                id="city"
                name="city"
                required
                error={errors.city}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                      errors.city
                        ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-navy-800'
                    }`}
                    aria-invalid={errors.city ? 'true' : 'false'}
                  />
                </div>
              </FormField>

              {/* State */}
              <FormField
                label="State / Union Territory"
                id="state"
                name="state"
                required
                error={errors.state}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 appearance-none bg-white ${
                      errors.state
                        ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-300 text-slate-900 focus:ring-navy-800'
                    }`}
                    aria-invalid={errors.state ? 'true' : 'false'}
                  >
                    <option value="">-- Select State or UT --</option>
                    <optgroup label="States (28)">
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Union Territories (8)">
                      {UNION_TERRITORIES.map((ut) => (
                        <option key={ut} value={ut}>
                          {ut}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </FormField>
            </div>

            {/* Declaration disclaimer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                By submitting this form, you verify that all supplied details are accurate and acknowledge that duplicate requests or false entries are subject to rejection.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full text-base font-semibold"
                rightIcon={ArrowRight}
              >
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
