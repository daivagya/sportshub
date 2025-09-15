import { getUserProfile } from "../_userActions/profile.actions";
import { User, Mail, CalendarCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import Button from "@/components/shared/Button";

export default async function ProfilePage() {
  try {
    // The action returns fullName, email, avatarUrl, and totalBookings
    const { name, email, image, totalBookings } = await getUserProfile();

    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
              My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Profile Card */}
              <div className="md:col-span-1">
                <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg overflow-hidden">
                  <CardContent className="flex flex-col items-center text-center p-8 bg-white">
                    <div className="relative mb-4">
                      <img
                        src={
                          image || // Use avatarUrl
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            name || "U" // Use fullName
                          )}&background=0D8ABC&color=fff&size=128`
                        }
                        alt={name || "User Avatar"} // Use fullName
                        className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-md"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {name} {/* Display fullName */}
                    </h2>
                    <p className="text-gray-500 mt-1">{email}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Details and Stats */}
              <div className="md:col-span-2">
                <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-xl font-semibold text-gray-700">
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 bg-white space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                      <User className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {name} {/* Display fullName */}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                      <Mail className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {email}
                        </p>
                      </div>
                    </div>

                    <div className="border-t my-6"></div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200">
                      <CalendarCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {totalBookings}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Graceful error handling for non-authenticated users
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 border border-red-200">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2 mb-6">
            You must be logged in to view your profile.
          </p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }
}
