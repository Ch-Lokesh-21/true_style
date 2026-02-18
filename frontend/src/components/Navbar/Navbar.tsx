import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  FavoriteBorder,
  ShoppingCartOutlined,
  PersonOutline,
  SearchOutlined,
} from "@mui/icons-material";
import { useAppSelector } from "../../app/store/hooks";
import { useLogout } from "../../features/auth/hooks/useAuth";
import { ROUTES } from "../../config/constants";
import logo from "../../assets/icons/logo.png";
export const Navbar = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleMenuItemClick = (path: string) => {
    handleClose();
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "white",
        color: "black",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar
        sx={{ justifyContent: "space-between", py: 1, px: { xs: 1, sm: 2 } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "80px", sm: "200px" },
          }}
        >
          <Link
            to={ROUTES.HOME}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                fontSize: { xs: "18px", sm: "24px" },
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              <img
                src={logo}
                alt="TrueStyle Logo"
                style={{ height: "40px", width: "auto" }}
              />
            </Box>
          </Link>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            px: 4,
          }}
        >
          <TextField
            placeholder="Search for products..."
            variant="outlined"
            size="small"
            sx={{
              maxWidth: "600px",
              width: "100%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
                backgroundColor: "#f5f5f5",
                "& fieldset": {
                  border: "none",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}
        >
          {isAuthenticated ? (
            <>
              <IconButton
                onClick={() => navigate(ROUTES.USER.WISHLIST)}
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                <FavoriteBorder />
              </IconButton>
              <IconButton onClick={() => navigate(ROUTES.USER.CART)}>
                <ShoppingCartOutlined />
              </IconButton>
              <IconButton onClick={handleProfileClick}>
                <PersonOutline />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    "& .MuiMenuItem-root": {
                      px: 2.5,
                      py: 1.5,
                      fontSize: "0.95rem",
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleMenuItemClick(ROUTES.USER.PROFILE)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  My Profile
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuItemClick(ROUTES.USER.ORDERS)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  My Orders
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuItemClick(ROUTES.USER.ADDRESSES)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  My Addresses
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuItemClick(ROUTES.USER.RETURNS)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  My Returns
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuItemClick(ROUTES.USER.EXCHANGES)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  My Exchanges
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuItemClick(ROUTES.USER.AI_SEARCH)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  AI Search
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: "#d32f2f",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.08)",
                    },
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={() => navigate(ROUTES.LOGIN)}
              sx={{
                borderRadius: "24px",
                textTransform: "none",
                px: { xs: 2, sm: 3 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                borderColor: "black",
                color: "black",
                "&:hover": {
                  borderColor: "black",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  textDecoration: "underline",
                },
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
