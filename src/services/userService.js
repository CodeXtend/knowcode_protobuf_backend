import User from "../db/models/Users.js";

export const createUser = async (userData) => {
  // Validate required fields
  if (!userData.auth0Id || !userData.role) {
    throw new Error("Auth0 ID and role are required");
  }
  // Validate role
  if (!["buyer", "farmer"].includes(userData.role)) {
    throw new Error("Invalid role specified");
  }

  // Validate role-specific required fields
  if (userData.role === "farmer" && !userData.farmDetails) {
    throw new Error("Farm details are required for farmers");
  }
  if (userData.role === "buyer" && !userData.businessDetails) {
    throw new Error("Business details are required for buyers");
  }

  try {
    // Create user in our database
    const user = await User.create({
      auth0Id: userData.auth0Id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
      location: userData.location,
      farmDetails: userData.farmDetails,
      businessDetails: userData.businessDetails,
      isVerified: false,
      active: true,
    });

    return user;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

export const verifyUser = async (auth0Id) => {
  try {
    console.log(auth0Id);
    const user = await User.findOne({ auth0Id: auth0Id });
    if (!user) {
      return {
        exists: false,
        role: null,
      };
    }
    return {
      exists: true,
      role: user.role,
      isVerified: user.isVerified,
    };
  } catch (error) {
    throw new Error(`Error verifying user: ${error.message}`);
  }
};

export const getUserData = async (auth0Id) => {
  try {
    const user = await User.findOne({ auth0Id }).select('-__v');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error(`Error fetching user data: ${error.message}`);
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
