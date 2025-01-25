import * as userService from "../services/userService.js";

export const registerAfterAuth0 = async (req, res) => {
  try {
    const auth0User = req.user;
    const user = await userService.createUser(req.body);

    res.status(201).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { auth0Id } = req.body;
    const user = await userService.getUserByAuth0Id(auth0Id.sub);

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

export const verifyUserExists = async (req, res) => {
  try {
    const { auth0Id } = req.body;
    if (!auth0Id) {
      return res.status(400).json({
        status: "error",
        message: "Auth0 ID is required"
      });
    }

    const verificationResult = await userService.verifyUser(auth0Id);
    
    res.status(200).json({
      status: "success",
      data: verificationResult
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

export const buyerLogin = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   const { user, token } = await userService.loginUser(email, password, 'buyer');
  //   res.status(200).json({
  //     status: 'success',
  //     data: { user, token }
  //   });
  // } catch (error) {
  //   res.status(401).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
};

// Rename sellerLogin to farmerLogin
export const farmerLogin = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   const { user, token } = await userService.loginUser(email, password, 'farmer');
  //   res.status(200).json({
  //     status: 'success',
  //     data: { user, token }
  //   });
  // } catch (error) {
  //   res.status(401).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
};

export const getUser = async (req, res) => {
  // try {
  //   const user = await userService.getUserById(req.params.id);
  //   res.status(200).json({
  //     status: 'success',
  //     data: { user }
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
};

export const updateUserProfile = async (req, res) => {
  // try {
  //   const user = await userService.updateUser(req.params.id, req.body);
  //   res.status(200).json({
  //     status: 'success',
  //     data: { user }
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
};

export const deleteUserProfile = async (req, res) => {
  // try {
  //   await userService.deleteUser(req.params.id);
  //   res.status(204).json({
  //     status: 'success',
  //     data: null
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'error',
  //     message: error.message
  //   });
  // }
};
