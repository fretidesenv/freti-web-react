import { useEffect, useState } from "react";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Paper } from "@mui/material";
import HourglassBottomOutlinedIcon from "@mui/icons-material/HourglassBottomOutlined";
import firebase from "../../config/firebase";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function CardHeadInTransitWithOcorrency({ value }) {
  return (
    <Paper
      sx={{
        height: 150,
        width: 260,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#1A2027" : "#fff",
      }}
    >
      <CardContent>
        <Typography variant="h2" sx={{ mb: 1.5 }} color="#fbca04">
          <div className="row">
            <div className="col-10">{value}</div>
          </div>
        </Typography>
        <Typography variant="h8" component="div">
          Em Transito com Ocorrência
        </Typography>
      </CardContent>
    </Paper>
  );
}
