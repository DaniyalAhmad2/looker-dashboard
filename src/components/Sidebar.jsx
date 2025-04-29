import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const Sidebar = ({
  open,
  onClose,
  items = [],
  width = 320,
  title = "Companies",
  onItemClick,
  anchor = "left",
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("name");
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedId, setSelectedId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const drawerWidth = isMobile ? "100%" : width;


  useEffect(() => {
    let result = [...items];


    if (searchTerm) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (typeof valueA === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
    });

    setFilteredItems(result);
  }, [items, searchTerm, sortOrder, sortBy]);


  const handleToggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleItemClick = (item) => {
    setSelectedId(item.id);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      variant={isMobile ? "temporary" : "persistent"}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Sort Controls */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <SortIcon color="action" />
          <FormControl variant="outlined" size="small" sx={{ flexGrow: 1 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
            >
              <MenuItem value="name">Company Name</MenuItem>
              <MenuItem value="id">Company ID</MenuItem>
            </Select>
          </FormControl>

          <Tooltip
            title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
          >
            <IconButton onClick={handleToggleSortOrder} size="small">
              {sortOrder === "asc" ? (
                <ArrowUpwardIcon />
              ) : (
                <ArrowDownwardIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      {/* Items List */}
      <List
        sx={{
          flexGrow: 1,
          overflow: "auto",
          px: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ListItem disablePadding key={item.id}>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                selected={selectedId === item.id}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "primary.dark",
                    "&:hover": {
                      backgroundColor: "primary.main",
                    },
                  },
                }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    noWrap: true,
                    style: { textOverflow: "ellipsis" },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No companies found</Typography>
          </Box>
        )}
      </List>

      <Divider />

      {/* Footer Area */}
      <Box sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
        <Typography variant="caption" color="text.secondary">
          {loading
            ? "Loading companies..."
            : `${filteredItems.length} of ${items.length} companies`}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
