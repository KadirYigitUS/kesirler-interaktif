# Dikdörtgen/Kare Dilimleme - Kesir Gösterimi
# Türkçe etiketler ve ders kitabı kalitesinde görsel

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "rect_slices.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# 2x2 grid = 4 eşit parça, 3 tanesi dolu
rects <- data.frame(
  xmin = c(0, 0.5, 0, 0.5),
  xmax = c(0.5, 1, 0.5, 1),
  ymin = c(0, 0, 0.5, 0.5),
  ymax = c(0.5, 0.5, 1, 1),
  durum = c("Dolu", "Dolu", "Dolu", "Boş"),
  etiket = c("1/4", "2/4", "3/4", "")
)

# Renk paleti (ders kitabı tarzı)
renkler <- c("Dolu" = "#66BB6A", "Boş" = "#EEEEEE")

p <- ggplot() +
  geom_rect(data = rects, 
            aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax, fill = durum),
            color = "#333333", linewidth = 1) +
  geom_text(data = rects, 
            aes(x = (xmin + xmax) / 2, y = (ymin + ymax) / 2, label = etiket),
            size = 6, fontface = "bold", color = "#333333") +
  scale_fill_manual(values = renkler, name = "Parça Durumu") +
  coord_fixed() +
  theme_void() +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "#666666"),
    legend.position = "bottom",
    legend.title = element_text(size = 10, face = "bold"),
    plot.margin = margin(15, 15, 15, 15)
  ) +
  labs(
    title = "Kare ile Kesir Gösterimi",
    subtitle = "1 bütün = 4 eşit parça → 3 parça dolu = 3/4"
  )

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 5, height = 5)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
