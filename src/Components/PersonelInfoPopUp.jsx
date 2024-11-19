import React, { useEffect, useState } from 'react';
import useUserStore from '../Stores/UserInfoPopUpStore';

const PersonalInfoPopup = ({ isOpen, closePopup }) => {
    const sendUserInfo = useUserStore((state) => state.sendUserInfo);
    const status = useUserStore((state) => state.status);
    const error = useUserStore((state) => state.error);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            setTimeout(() => setVisible(false), 500);
        }
    }, [isOpen]);

    if (!visible) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const personalData = {
            name: e.target.name.value,
            surname: e.target.surname.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            videoUrl: "https://example.com/video",
            status: "inactive",
            note: "Not Girilmemiş",
        };

        sendUserInfo(personalData);
        closePopup();
    };

    return (
        <div
            className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'
                }`}
        >
            <div
                className={`bg-white p-6 rounded-lg shadow-lg relative transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-y-0' : '-translate-y-10'
                    } w-full max-w-lg mx-auto 
                lg:max-w-lg lg:rounded-lg lg:p-6 lg:max-h-[80%] lg:h-auto
                md:w-full md:max-w-md md:p-4 md:max-h-[75%] md:h-auto
                sm:w-full sm:max-w-full sm:rounded-none sm:h-screen sm:overflow-y-auto`}
            >
                <h2 className="text-xl font-bold mb-4">Personal Information Form</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Name*</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            className="border p-2 rounded-md w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Surname*</label>
                        <input
                            type="text"
                            name="surname"
                            placeholder="Enter your surname"
                            className="border p-2 rounded-md w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Email*</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            className="border p-2 rounded-md w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Phone*</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="(5**) *** ** **"
                            className="border p-2 rounded-md w-full"
                            required
                        />
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" className="mr-2" required />
                        <label className="text-sm">I have read and approved the KVKK text.</label>
                    </div>

                    {status === 'error' && <p className="text-red-500">Error: {error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-md"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PersonalInfoPopup;