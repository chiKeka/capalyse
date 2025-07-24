import { User } from 'lucide-react';

const ContactDetails = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          <User className="w-10 h-10 text-gray-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
          <p className="text-gray-600">janeearnest@gmail.com</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Name</span>
          <span className="font-semibold text-gray-900">John Doe</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Phone Number</span>
          <span className="font-semibold text-gray-900">12345678</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Country</span>
          <span className="font-semibold text-gray-900">Nigeria</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">State</span>
          <span className="font-semibold text-gray-900">Kano</span>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
