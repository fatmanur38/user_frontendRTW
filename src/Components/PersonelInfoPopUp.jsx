import React, { useEffect, useState } from 'react';
import useUserStore from '../Stores/UserInfoPopUpStore';

const PersonalInfoPopup = ({ isOpen, closePopup, savePersonalInfo }) => {
    const sendUserInfo = useUserStore((state) => state.sendUserInfo);
    const status = useUserStore((state) => state.status);
    const error = useUserStore((state) => state.error);
    const [visible, setVisible] = useState(false); // Control visibility for animation

    // Animate the popup to slide down
    useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            setTimeout(() => setVisible(false), 500); // Allow the animation to complete
        }
    }, [isOpen]);

    if (!visible) return null; // Hide the component entirely when not visible

    const handleSubmit = (e) => {
        e.preventDefault();

        const personalData = {
            name: e.target.name.value,
            surname: e.target.surname.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            videoUrl: "https://example.com/video",
            status: "active",
            note: "Yeni kullanıcı notu",
        };

        closePopup();
        console.log(personalData);
        sendUserInfo(personalData);
    };

    return (
        <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ease-in-out`}>
            <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto relative transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-y-0' : '-translate-y-10'}`}>
                <button onClick={closePopup} className="absolute top-4 right-4 text-xl font-bold">
                    &times;
                </button>
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
                        <input
                            type="checkbox"
                            className="mr-2"
                            required
                        />
                        <label className="text-sm">
                            I have read and approved the KVKK text.
                        </label>
                    </div>

                    {status === 'error' && <p className="text-red-500">Error: {error}</p>}

                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-md">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PersonalInfoPopup;