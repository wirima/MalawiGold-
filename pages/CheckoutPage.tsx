import React, { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

const detectCardType = (number: string): CardType => {
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'unknown';
};

const CardIcons: React.FC<{ activeType: CardType }> = ({ activeType }) => {
    const iconBaseClass = "h-7 transition-opacity";
    const inactiveClass = "opacity-20";
    const activeClass = "opacity-100";

    return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1 pointer-events-none">
            <svg viewBox="0 0 48 48" className={`${iconBaseClass} ${activeType === 'visa' || activeType === 'unknown' ? activeClass : inactiveClass}`}><path fill="#1A1F71" d="M34.6,26.5,33.5,17H25v9.5Z"/><path fill="#1A1F71" d="M15.4,26.5,13,17H5.4l2.4,9.5Z"/><path fill="#1A1F71" d="M20.5,17h-3.3L15.4,22l-0.1,0.5,0.8,4H19l3.1-9.5H20.5z"/><path fill="#1A1F71" d="M42.6,17H36.8L35.2,24,34.6,22,33.5,17H25v9.5h9.1C34.1,26.5,34.6,26.5,34.6,26.5l0.4-1.7,0.1-0.7,0.1-0.5,0.7-3.2,0.5-2.1h6L42.6,17Z"/></svg>
            <svg viewBox="0 0 48 48" className={`${iconBaseClass} ${activeType === 'mastercard' || activeType === 'unknown' ? activeClass : inactiveClass}`}><path fill="#F59F00" d="M30,24c0,6.6-5.4,12-12,12S6,30.6,6,24S11.4,12,18,12S30,17.4,30,24z"/><path fill="#EB001B" d="M42,24c0,6.6-5.4,12-12,12S18,30.6,18,24S23.4,12,30,12S42,17.4,42,24z"/><path fill="#FF5F00" d="M33.6,24c0,2.1-0.6,4-1.5,5.7c-0.9-1.7-1.5-3.6-1.5-5.7s0.6-4,1.5-5.7C33,20,33.6,21.9,33.6,24z"/></svg>
            <svg viewBox="0 0 48 48" className={`${iconBaseClass} ${activeType === 'amex' || activeType === 'unknown' ? activeClass : inactiveClass}`}><path fill="#016FD0" d="M42,39H6V9h36V39z M13,18h-4v12h4V18z M22.5,18h-4v12h4V18z M35,24h-8v-3h8V24z M35,27h-8v3h8V27z M35,18h-8v3h8V18z"/></svg>
        </div>
    );
};

const CheckoutPage: React.FC = () => {
    const { signUpAndSubscribe } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [cardType, setCardType] = useState<CardType>('unknown');

    const [formData, setFormData] = useState({
        businessName: '',
        email: '',
        password: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: '',
        country: 'United States',
        addressLine1: '',
        city: '',
        state: '',
        zipcode: '',
    });

    const plan = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('plan') || 'bundle';
    }, [location.search]);

    const planDetails = useMemo(() => {
        switch (plan) {
            case 'pos':
                return { name: 'POS Plan', price: 15 };
            case 'inventory':
                return { name: 'Inventory Plan', price: 15 };
            case 'professional':
                return { name: 'Professional', price: 35 };
            case 'bundle':
            default:
                return { name: 'Business Bundle', price: 25 };
        }
    }, [plan]);

    const totalPrice = useMemo(() => {
        if (billingCycle === 'annually') {
            return planDetails.price * 12 * 0.9; // 10% discount for annual
        }
        return planDetails.price;
    }, [billingCycle, planDetails.price]);
    
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const number = e.target.value.replace(/\s/g, '');
        if (/^\d*$/.test(number)) {
            setFormData(prev => ({ ...prev, cardNumber: number }));
            setCardType(detectCardType(number));
        }
    };

    const handleCompletePurchase = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.businessName || !formData.email || !formData.password) {
            setError('Please fill out all account fields.');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            await signUpAndSubscribe({
                email: formData.email,
                password: formData.password,
                businessName: formData.businessName,
                planName: planDetails.name
            });
            navigate('/onboarding/welcome');
        } catch (err: any) {
             setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 border-transparent focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400";

    return (
        <div className="py-12 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">Complete Your Subscription</h1>
                <form onSubmit={handleCompletePurchase}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left Column */}
                        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 text-slate-900">
                             <section>
                                <h2 className="text-xl font-semibold mb-4">1. Create Your Account</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Business Name*</label>
                                        <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} required className={baseInputClasses} placeholder="Your Company LLC" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Email Address*</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={baseInputClasses} placeholder="you@company.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Password*</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className={baseInputClasses} placeholder="••••••••" />
                                        <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters long.</p>
                                    </div>
                                </div>
                            </section>
                             <section>
                                <h2 className="text-xl font-semibold mb-4">2. Payment Information</h2>
                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-sm font-medium text-slate-700">Card Number</label>
                                        <div className="relative">
                                            <input type="text" placeholder="XXXX XXXX XXXX XXXX" className={`${baseInputClasses} pr-32`} value={formData.cardNumber} onChange={handleCardNumberChange} />
                                            <CardIcons activeType={cardType} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Expiration</label>
                                            <input type="text" placeholder="MM / YY" className={baseInputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">CVC</label>
                                            <input type="text" placeholder="CVC" className={baseInputClasses} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Name on Card</label>
                                        <input type="text" placeholder="Full Name on Card" className={baseInputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Country</label>
                                        <select name="country" value={formData.country} onChange={handleInputChange} className={baseInputClasses}>
                                            <option value="Afghanistan">Afghanistan</option>
                                            <option value="Albania">Albania</option>
                                            <option value="Algeria">Algeria</option>
                                            <option value="American Samoa">American Samoa</option>
                                            <option value="Andorra">Andorra</option>
                                            <option value="Angola">Angola</option>
                                            <option value="Anguilla">Anguilla</option>
                                            <option value="Antarctica">Antarctica</option>
                                            <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                                            <option value="Argentina">Argentina</option>
                                            <option value="Armenia">Armenia</option>
                                            <option value="Aruba">Aruba</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Austria">Austria</option>
                                            <option value="Azerbaijan">Azerbaijan</option>
                                            <option value="Bahamas">Bahamas</option>
                                            <option value="Bahrain">Bahrain</option>
                                            <option value="Bangladesh">Bangladesh</option>
                                            <option value="Barbados">Barbados</option>
                                            <option value="Belarus">Belarus</option>
                                            <option value="Belgium">Belgium</option>
                                            <option value="Belize">Belize</option>
                                            <option value="Benin">Benin</option>
                                            <option value="Bermuda">Bermuda</option>
                                            <option value="Bhutan">Bhutan</option>
                                            <option value="Bolivia">Bolivia</option>
                                            <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                                            <option value="Botswana">Botswana</option>
                                            <option value="Brazil">Brazil</option>
                                            <option value="British Indian Ocean Territory">British Indian Ocean Territory</option>
                                            <option value="Brunei Darussalam">Brunei Darussalam</option>
                                            <option value="Bulgaria">Bulgaria</option>
                                            <option value="Burkina Faso">Burkina Faso</option>
                                            <option value="Burundi">Burundi</option>
                                            <option value="Cambodia">Cambodia</option>
                                            <option value="Cameroon">Cameroon</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Cape Verde">Cape Verde</option>
                                            <option value="Cayman Islands">Cayman Islands</option>
                                            <option value="Central African Republic">Central African Republic</option>
                                            <option value="Chad">Chad</option>
                                            <option value="Chile">Chile</option>
                                            <option value="China">China</option>
                                            <option value="Christmas Island">Christmas Island</option>
                                            <option value="Cocos (Keeling) Islands">Cocos (Keeling) Islands</option>
                                            <option value="Colombia">Colombia</option>
                                            <option value="Comoros">Comoros</option>
                                            <option value="Congo">Congo</option>
                                            <option value="Cook Islands">Cook Islands</option>
                                            <option value="Costa Rica">Costa Rica</option>
                                            <option value="Cote D'ivoire">Cote D'ivoire</option>
                                            <option value="Croatia">Croatia</option>
                                            <option value="Cuba">Cuba</option>
                                            <option value="Cyprus">Cyprus</option>
                                            <option value="Czech Republic">Czech Republic</option>
                                            <option value="Denmark">Denmark</option>
                                            <option value="Djibouti">Djibouti</option>
                                            <option value="Dominica">Dominica</option>
                                            <option value="Dominican Republic">Dominican Republic</option>
                                            <option value="Ecuador">Ecuador</option>
                                            <option value="Egypt">Egypt</option>
                                            <option value="El Salvador">El Salvador</option>
                                            <option value="Equatorial Guinea">Equatorial Guinea</option>
                                            <option value="Eritrea">Eritrea</option>
                                            <option value="Estonia">Estonia</option>
                                            <option value="Ethiopia">Ethiopia</option>
                                            <option value="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</option>
                                            <option value="Faroe Islands">Faroe Islands</option>
                                            <option value="Fiji">Fiji</option>
                                            <option value="Finland">Finland</option>
                                            <option value="France">France</option>
                                            <option value="French Guiana">French Guiana</option>
                                            <option value="French Polynesia">French Polynesia</option>
                                            <option value="Gabon">Gabon</option>
                                            <option value="Gambia">Gambia</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Germany">Germany</option>
                                            <option value="Ghana">Ghana</option>
                                            <option value="Gibraltar">Gibraltar</option>
                                            <option value="Greece">Greece</option>
                                            <option value="Greenland">Greenland</option>
                                            <option value="Grenada">Grenada</option>
                                            <option value="Guadeloupe">Guadeloupe</option>
                                            <option value="Guam">Guam</option>
                                            <option value="Guatemala">Guatemala</option>
                                            <option value="Guernsey">Guernsey</option>
                                            <option value="Guinea">Guinea</option>
                                            <option value="Guinea-bissau">Guinea-bissau</option>
                                            <option value="Guyana">Guyana</option>
                                            <option value="Haiti">Haiti</option>
                                            <option value="Honduras">Honduras</option>
                                            <option value="Hong Kong">Hong Kong</option>
                                            <option value="Hungary">Hungary</option>
                                            <option value="Iceland">Iceland</option>
                                            <option value="India">India</option>
                                            <option value="Indonesia">Indonesia</option>
                                            <option value="Iran, Islamic Republic of">Iran, Islamic Republic of</option>
                                            <option value="Iraq">Iraq</option>
                                            <option value="Ireland">Ireland</option>
                                            <option value="Isle of Man">Isle of Man</option>
                                            <option value="Israel">Israel</option>
                                            <option value="Italy">Italy</option>
                                            <option value="Jamaica">Jamaica</option>
                                            <option value="Japan">Japan</option>
                                            <option value="Jersey">Jersey</option>
                                            <option value="Jordan">Jordan</option>
                                            <option value="Kazakhstan">Kazakhstan</option>
                                            <option value="Kenya">Kenya</option>
                                            <option value="Kiribati">Kiribati</option>
                                            <option value="Korea, Democratic People's Republic of">Korea, Democratic People's Republic of</option>
                                            <option value="Korea, Republic of">Korea, Republic of</option>
                                            <option value="Kuwait">Kuwait</option>
                                            <option value="Kyrgyzstan">Kyrgyzstan</option>
                                            <option value="Lao People's Democratic Republic">Lao People's Democratic Republic</option>
                                            <option value="Latvia">Latvia</option>
                                            <option value="Lebanon">Lebanon</option>
                                            <option value="Lesotho">Lesotho</option>
                                            <option value="Liberia">Liberia</option>
                                            <option value="Libyan Arab Jamahiriya">Libyan Arab Jamahiriya</option>
                                            <option value="Liechtenstein">Liechtenstein</option>
                                            <option value="Lithuania">Lithuania</option>
                                            <option value="Luxembourg">Luxembourg</option>
                                            <option value="Macao">Macao</option>
                                            <option value="Macedonia, The Former Yugoslav Republic of">Macedonia, The Former Yugoslav Republic of</option>
                                            <option value="Madagascar">Madagascar</option>
                                            <option value="Malawi">Malawi</option>
                                            <option value="Malaysia">Malaysia</option>
                                            <option value="Maldives">Maldives</option>
                                            <option value="Mali">Mali</option>
                                            <option value="Malta">Malta</option>
                                            <option value="Marshall Islands">Marshall Islands</option>
                                            <option value="Martinique">Martinique</option>
                                            <option value="Mauritania">Mauritania</option>
                                            <option value="Mauritius">Mauritius</option>
                                            <option value="Mayotte">Mayotte</option>
                                            <option value="Mexico">Mexico</option>
                                            <option value="Micronesia, Federated States of">Micronesia, Federated States of</option>
                                            <option value="Moldova, Republic of">Moldova, Republic of</option>
                                            <option value="Monaco">Monaco</option>
                                            <option value="Mongolia">Mongolia</option>
                                            <option value="Montenegro">Montenegro</option>
                                            <option value="Montserrat">Montserrat</option>
                                            <option value="Morocco">Morocco</option>
                                            <option value="Mozambique">Mozambique</option>
                                            <option value="Myanmar">Myanmar</option>
                                            <option value="Namibia">Namibia</option>
                                            <option value="Nauru">Nauru</option>
                                            <option value="Nepal">Nepal</option>
                                            <option value="Netherlands">Netherlands</option>
                                            <option value="Netherlands Antilles">Netherlands Antilles</option>
                                            <option value="New Caledonia">New Caledonia</option>
                                            <option value="New Zealand">New Zealand</option>
                                            <option value="Nicaragua">Nicaragua</option>
                                            <option value="Niger">Niger</option>
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="Niue">Niue</option>
                                            <option value="Norfolk Island">Norfolk Island</option>
                                            <option value="Northern Mariana Islands">Northern Mariana Islands</option>
                                            <option value="Norway">Norway</option>
                                            <option value="Oman">Oman</option>
                                            <option value="Pakistan">Pakistan</option>
                                            <option value="Palau">Palau</option>
                                            <option value="Palestinian Territory, Occupied">Palestinian Territory, Occupied</option>
                                            <option value="Panama">Panama</option>
                                            <option value="Papua New Guinea">Papua New Guinea</option>
                                            <option value="Paraguay">Paraguay</option>
                                            <option value="Peru">Peru</option>
                                            <option value="Philippines">Philippines</option>
                                            <option value="Pitcairn">Pitcairn</option>
                                            <option value="Poland">Poland</option>
                                            <option value="Portugal">Portugal</option>
                                            <option value="Puerto Rico">Puerto Rico</option>
                                            <option value="Qatar">Qatar</option>
                                            <option value="Reunion">Reunion</option>
                                            <option value="Romania">Romania</option>
                                            <option value="Russian Federation">Russian Federation</option>
                                            <option value="Rwanda">Rwanda</option>
                                            <option value="Saint Helena">Saint Helena</option>
                                            <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                            <option value="Saint Lucia">Saint Lucia</option>
                                            <option value="Saint Pierre and Miquelon">Saint Pierre and Miquelon</option>
                                            <option value="Saint Vincent and The Grenadines">Saint Vincent and The Grenadines</option>
                                            <option value="Samoa">Samoa</option>
                                            <option value="San Marino">San Marino</option>
                                            <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                                            <option value="Saudi Arabia">Saudi Arabia</option>
                                            <option value="Senegal">Senegal</option>
                                            <option value="Serbia">Serbia</option>
                                            <option value="Seychelles">Seychelles</option>
                                            <option value="Sierra Leone">Sierra Leone</option>
                                            <option value="Singapore">Singapore</option>
                                            <option value="Slovakia">Slovakia</option>
                                            <option value="Slovenia">Slovenia</option>
                                            <option value="Solomon Islands">Solomon Islands</option>
                                            <option value="Somalia">Somalia</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Spain">Spain</option>
                                            <option value="Sri Lanka">Sri Lanka</option>
                                            <option value="Sudan">Sudan</option>
                                            <option value="Suriname">Suriname</option>
                                            <option value="Svalbard and Jan Mayen">Svalbard and Jan Mayen</option>
                                            <option value="Swaziland">Swaziland</option>
                                            <option value="Sweden">Sweden</option>
                                            <option value="Switzerland">Switzerland</option>
                                            <option value="Syrian Arab Republic">Syrian Arab Republic</option>
                                            <option value="Taiwan, Province of China">Taiwan, Province of China</option>
                                            <option value="Tajikistan">Tajikistan</option>
                                            <option value="Tanzania, United Republic of">Tanzania, United Republic of</option>
                                            <option value="Thailand">Thailand</option>
                                            <option value="Timor-leste">Timor-leste</option>
                                            <option value="Togo">Togo</option>
                                            <option value="Tokelau">Tokelau</option>
                                            <option value="Tonga">Tonga</option>
                                            <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                                            <option value="Tunisia">Tunisia</option>
                                            <option value="Turkey">Turkey</option>
                                            <option value="Turkmenistan">Turkmenistan</option>
                                            <option value="Turks and Caicos Islands">Turks and Caicos Islands</option>
                                            <option value="Tuvalu">Tuvalu</option>
                                            <option value="Uganda">Uganda</option>
                                            <option value="Ukraine">Ukraine</option>
                                            <option value="United Arab Emirates">United Arab Emirates</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="United States">United States</option>
                                            <option value="Uruguay">Uruguay</option>
                                            <option value="Uzbekistan">Uzbekistan</option>
                                            <option value="Vanuatu">Vanuatu</option>
                                            <option value="Venezuela">Venezuela</option>
                                            <option value="Viet Nam">Viet Nam</option>
                                            <option value="Virgin Islands, British">Virgin Islands, British</option>
                                            <option value="Virgin Islands, U.S.">Virgin Islands, U.S.</option>
                                            <option value="Wallis and Futuna">Wallis and Futuna</option>
                                            <option value="Western Sahara">Western Sahara</option>
                                            <option value="Yemen">Yemen</option>
                                            <option value="Zambia">Zambia</option>
                                            <option value="Zimbabwe">Zimbabwe</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Address Line 1</label>
                                        <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className={baseInputClasses} placeholder="123 Main St" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">City</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={baseInputClasses} placeholder="Anytown" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">State / Province</label>
                                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={baseInputClasses} placeholder="California" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Postal / Zip Code (Optional)</label>
                                        <input type="text" name="zipcode" value={formData.zipcode} onChange={handleInputChange} className={baseInputClasses} placeholder="12345" />
                                    </div>
                                </div>
                                 <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300" /></div>
                                    <div className="relative flex justify-center"><span className="bg-white px-2 text-sm text-slate-500">Or pay with</span></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <button type="button" onClick={() => alert('Redirecting to PayPal... (Simulation)')} className="flex h-12 items-center justify-center p-3 border border-slate-300 rounded-md hover:bg-slate-50">
                                        <svg viewBox="0 0 24 24" className="h-6"><path fill="#003087" d="M22.6 6.1H7.8C7 6.1 6.3 6.8 6.2 7.6L4.5 18.2c-.1.8.5 1.5 1.3 1.5h4.6c.8 0 1.5-.7 1.5-1.5v-1.2c0-.8-.7-1.5-1.5-1.5H8.9l.6-4h11c.8 0 1.5-.7 1.5-1.5L23.9 7.6c.1-.8-.5-1.5-1.3-1.5z"/><path fill="#009cde" d="M3.4 8.5h6.1c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5H5.7C4.9 5.5 4.2 6.2 4 7L3.4 8.5z"/><path fill="#002f86" d="M10.5 11.5L8.9 2.5l-.2-.9C8.4.8 7.6 0 6.6 0H1.4C.6 0 0 .7 0 1.5L1.8 12c.1.8.8 1.5 1.6 1.5h4.1c.8 0 1.5-.7 1.5-1.5v-.5z"/></svg>
                                    </button>
                                    <button type="button" onClick={() => alert('Opening Google Pay... (Simulation)')} className="flex h-12 items-center justify-center p-3 border border-slate-300 rounded-md hover:bg-slate-50">
                                        <svg className="h-5" viewBox="0 0 52 20"><path fill="#5f6368" d="M12.2 6.4c0 2.2-1.5 3.5-3.6 3.5-2.1 0-3.6-1.3-3.6-3.5 0-2.2 1.5-3.5 3.6-3.5s3.6 1.3 3.6 3.5zm-6.2 0c0 1.6 1 2.6 2.6 2.6s2.6-1 2.6-2.6-1-2.6-2.6-2.6-2.6 1-2.6 2.6zM19.7 6.4c0 2.2-1.5 3.5-3.6 3.5-2.1 0-3.6-1.3-3.6-3.5 0-2.2 1.5-3.5 3.6-3.5s3.6 1.3 3.6 3.5zm-6.2 0c0 1.6 1 2.6 2.6 2.6s2.6-1 2.6-2.6-1-2.6-2.6-2.6-2.6 1-2.6 2.6zM28.4 6.6h-2.2v6.6h2.1l-.1-1.3h.1c.5.9 1.5 1.5 2.6 1.5 2.1 0 3.3-1.6 3.3-3.5 0-1.9-1.2-3.3-3.2-3.3-.9 0-1.7.4-2.5 1.1v-1.1zm-.1 5.3c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4-.6-1.4-1.4-1.4-1.4.6-1.4 1.4zM42.4 6.8h-2.1l-2.7 8.4h2.2l.5-1.8h3.2l.3 1.8h2.1l-2.8-8.4zm-.4 5.3l1.1-3.6 1.1 3.6h-2.2zM45.1 3.1h2.2v12.1h-2.2zM2.8 15.2L0 15.2V1.1h2.8c1.6 0 2.7.4 3.4 1.1.7.7 1.1 1.7 1.1 2.9 0 1.2-.4 2.1-1.1 2.8-.7.7-1.7 1-3.1 1h-1.3V12h1.3c2 0 3.1.5 3.8 1.4.7.9 1.1 2.2 1.1 3.8v.3h-2.2c0-1.1-.3-2-.8-2.6s-1.2-.9-2.2-.9H2.8v3.2zM2.8 3.5v3.2h1.3c.9 0 1.6-.2 2-.6.4-.4.6-1 .6-1.6 0-.6-.2-1.2-.6-1.6-.4-.4-1.1-.6-2-.6H2.8z"/></svg>
                                    </button>
                                    <button type="button" onClick={() => alert('Opening Apple Pay... (Simulation)')} className="flex h-12 items-center justify-center p-3 border border-slate-300 rounded-md hover:bg-slate-50">
                                       <svg className="h-6" viewBox="0 0 64 26"><path fill="black" d="M22.4 9.1c-1.3 0-2.3.4-3.1 1.2s-1.3 1.8-1.4 3h6.3c.1-1.1-.3-2.1-1-2.8-.8-.6-1.8-1-2.8-1.4z M33.6 17.5c1.2 0 2.3-.4 3.1-1.2s1.3-1.8 1.4-3h-6.3c-.1 1.1.3 2.1 1 2.8.8.6 1.8 1 2.8 1.4z M28 20.1c2.1 0 3.9-.7 5.3-2.1s2.1-3.2 2.1-5.3-1-3.9-2-5.3-3-2.1-5-2.1-3.9.7-5.3 2.1-2.1 3.2-2.1 5.3.7 3.9 2.1 5.3c1.4 1.3 3.2 2 5.2 2.1z M49.5 7.4h-3.4l-3.3 10.1h2.3l.6-2h3.2l.4 2h2.2l-2-10.1z M46.9 14.1l1.2-3.8 1.2 3.8h-2.4z M59.7 7.4h-2.3l-2.1 8.5-2.1-8.5h-2.3l3.3 10.1h1.9z M13 14.4c.1.9.5 1.6 1.1 2.2.7.5 1.5.8 2.6.8s1.9-.3 2.5-.8.9-1.3 1-2.2h2.1c-.1 1.2-.5 2.2-1.3 3s-1.7 1.3-3.1 1.5-2.6-.1-3.8-1-1.9-2.1-2.2-3.7-.3-3.1.2-4.5 1.3-2.5 2.5-3.3c1.2-.8 2.6-1.2 4.1-1.2s2.8.4 3.9 1.1 1.6 1.7 1.6 2.9h-2c0-.5-.2-1-.7-1.3s-1.1-.5-2-.5-1.6.2-2.3.7-1.2 1.3-1.4 2.3z M8.2 17.5l2.2-10.1h2.3L10.5 16l2.1 1.5h-2.4L8.2 16z M0 7.4h4.4v1.8H2.3v2.3h2v1.8H2.3v2.6h2.2v1.8H0z"/></svg>
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="bg-white rounded-lg shadow-lg p-6 lg:sticky lg:top-28 text-slate-900">
                            <h2 className="text-xl font-semibold border-b pb-4 border-slate-200">Order Summary</h2>
                             <div className="mt-4">
                                <label className="block text-sm font-medium mb-2 text-slate-700">Billing Cycle</label>
                                <div className="relative flex p-1 bg-slate-100 rounded-lg">
                                    <span
                                        className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-md bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                                            billingCycle === 'annually' ? 'translate-x-full' : 'translate-x-0'
                                        }`}
                                        aria-hidden="true"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('monthly')}
                                        className={`relative w-1/2 py-2 text-sm font-semibold rounded-md z-10 ${
                                            billingCycle === 'monthly' ? 'text-indigo-600' : 'text-slate-500'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('annually')}
                                        className={`relative w-1/2 py-2 text-sm font-semibold rounded-md z-10 ${
                                            billingCycle === 'annually' ? 'text-indigo-600' : 'text-slate-500'
                                        }`}
                                    >
                                        Annually (Save 10%)
                                    </button>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between">
                                    <span>{planDetails.name} ({billingCycle === 'monthly' ? 'Monthly' : 'Annually'})</span>
                                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Tax (est.)</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-4 border-slate-200">
                                    <span>Total Due Today</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
                             <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                            >
                                {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)} and Subscribe`}
                            </button>
                             <p className="text-xs text-slate-500 text-center mt-2">
                                By clicking subscribe, you agree to our Terms of Service. This is a simulation and your card will not be charged.
                            </p>
                        </div>
                    </div>
                </form>
                 <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default CheckoutPage;