import User from "../db/models/Users.js";
import { ManagementClient } from "auth0";

const auth0Management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

export const createUser = async (userData) => {
  // Validate required fields
  if (!userData.auth0Id || !userData.role) {
    throw new Error("Auth0 ID and role are required");
  }
  // Validate role
  if (!["buyer", "seller"].includes(userData.role)) {
    throw new Error("Invalid role specified");
  }

  // Validate role-specific required fields
  if (userData.role === "seller" && !userData.farmDetails) {
    throw new Error("Farm details are required for sellers");
  }
  if (userData.role === "buyer" && !userData.businessDetails) {
    throw new Error("Business details are required for buyers");
  }

  try {
    // Get user info from Auth0
    const auth0User = await auth0Management.getUser({
      id: userData.auth0Id.split("|")[1],
    });

    // Create user in our database
    const user = await User.create({
      auth0Id: userData.auth0Id.split("|")[1],
      email: auth0User.email,
      name: userData.name || auth0User.name,
      role: userData.role,
      phone: userData.phone,
      location: userData.location,
      farmDetails: userData.farmDetails,
      businessDetails: userData.businessDetails,
      isVerified: false,
      active: true,
    });

    // Update Auth0 user metadata with our database user ID
    await auth0Management.updateUserMetadata(
      { id: userData.auth0Id.split("|")[1] },
      { app_user_id: user._id.toString() }
    );

    return user;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// export const getUserByAuth0Id = async (auth0Id) => {
//   try {
//     const user = await User.findOne({ auth0Id });
//     if (!user) {
//       throw new Error('User not found');
//     }
//     return user;
//   } catch (error) {
//     throw new Error(`Error fetching user: ${error.message}`);
//   }
// };

// export const getUserById = async (id) => {
//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       throw new Error('User not found');
//     }
//     return user;
//   } catch (error) {
//     throw new Error(`Error fetching user: ${error.message}`);
//   }
// };

// export const updateUser = async (id, updateData) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );
//     if (!user) {
//       throw new Error('User not found');
//     }
//     return user;
//   } catch (error) {
//     throw new Error(`Error updating user: ${error.message}`);
//   }
// };

// export const deleteUser = async (id) => {
//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Delete from Auth0
//     await auth0Management.deleteUser({ id: user.auth0Id });

//     // Delete from our database
//     await User.findByIdAndDelete(id);

//     return true;
//   } catch (error) {
//     throw new Error(`Error deleting user: ${error.message}`);
//   }
// };
