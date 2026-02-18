import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Select,
  MenuItem,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, YouTube } from "@mui/icons-material";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f5f5f5",
        pt: 6,
        pb: 4,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", fontSize: "14px" }}
            >
              DOWNLOAD THE APP
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  backgroundColor: "white",
                }}
              >
                <Typography sx={{ fontSize: "12px" }}>GET IT ON</Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  Google Play
                </Typography>
              </Box>
              <Box
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  backgroundColor: "white",
                }}
              >
                <Typography sx={{ fontSize: "12px" }}>
                  Download on the
                </Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                  App Store
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", fontSize: "14px" }}
            >
              SHOP
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                WOMAN
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                MAN
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                HOME
              </Link>
            </Box>
          </Box>

          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", fontSize: "14px" }}
            >
              SITES & STORES
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                ABOUT US
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                CONTACT US
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                STORE LOCATOR
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                MEDIA CENTER
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: "none",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                SITEMAP
              </Link>
            </Box>
          </Box>

          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", fontSize: "14px" }}
            >
              SHIPPING LOCATION
            </Typography>
            <Select
              defaultValue="India"
              size="small"
              sx={{
                width: "100%",
                backgroundColor: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ddd",
                },
              }}
            >
              <MenuItem value="India">India</MenuItem>
            </Select>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: "1px solid #ddd",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <MuiLink
              href="#"
              sx={{ color: "#666", fontSize: "12px", textDecoration: "none" }}
            >
              TERMS & CONDITIONS
            </MuiLink>
            
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton href="#" sx={{ color: "#666" }}>
              <Twitter />
            </IconButton>
            <IconButton href="#" sx={{ color: "#666" }}>
              <Facebook />
            </IconButton>
            <IconButton href="#" sx={{ color: "#666" }}>
              <Instagram />
            </IconButton>
            <IconButton href="#" sx={{ color: "#666" }}>
              <YouTube />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const IconButton = ({
  children,
  href,
  sx,
}: {
  children: React.ReactNode;
  href: string;
  sx?: Record<string, unknown>;
}) => {
  return (
    <MuiLink
      href={href}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        border: "1px solid #ddd",
        textDecoration: "none",
        "&:hover": {
          backgroundColor: "#f0f0f0",
        },
        ...sx,
      }}
    >
      {children}
    </MuiLink>
  );
};
