# Pizza/Pasta Dilimleri - Kesir Gösterimi
# Türkçe etiketler ve ders kitabı kalitesinde görsel

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "pizza_pasta_slices.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# Dilim verisi: 8 dilimlik pizza, 3 dilim alınmış
n_slices <- 8
taken <- 3
df <- data.frame(
  slice = 1:n_slices,
  value = rep(1, n_slices),
  durum = ifelse(1:n_slices <= taken, "Alınan", "Kalan")
)

# Renk paleti (ders kitabı tarzı)
renkler <- c("Alınan" = "#4CAF50", "Kalan" = "#E0E0E0")

p <- ggplot(df, aes(x = "", y = value, fill = durum)) +
  geom_bar(stat = "identity", width = 1, color = "white", linewidth = 1.5) +
  coord_polar(theta = "y", start = 0) +
  scale_fill_manual(values = renkler, name = "Dilimler") +
  theme_void() +
  theme(
    plot.title = element_text(size = 16, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 12, hjust = 0.5, color = "#666666"),
    legend.position = "bottom",
    legend.title = element_text(size = 10, face = "bold"),
    legend.text = element_text(size = 9)
  ) +
  labs(
    title = "Pizza ile Kesir Gösterimi",
    subtitle = paste0("8 dilimden ", taken, " tanesi alındı → ", taken, "/8 kesri")
  )

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 6, height = 6)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
