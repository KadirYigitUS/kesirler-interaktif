# Kesirlerle Çarpma İşlemi Gösterimi
# 1/2 × 1/2 = 1/4 görselleştirmesi

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "multiplication_fraction.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# 2x2 ızgara: 1/2 × 1/2 = 1/4
cells <- expand.grid(i = 1:2, j = 1:2)
cells$xmin <- (cells$i - 1) / 2
cells$xmax <- cells$i / 2
cells$ymin <- (cells$j - 1) / 2
cells$ymax <- cells$j / 2

# Sol-alt köşe = sonuç (1/4), diğerleri = tam bölüm
cells$durum <- ifelse(cells$i == 1 & cells$j == 1, "Sonuç (1/4)", "Kalan parçalar")
cells$fill <- ifelse(cells$i == 1 & cells$j == 1, "#FF7043", "#B0BEC5")

# Hücre etiketleri
cells$label <- c("1/4", "1/4", "1/4", "1/4")

p <- ggplot() +
  # Hücreler
  geom_rect(data = cells, 
            aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax, fill = durum), 
            color = "white", linewidth = 2) +
  # Her hücrede kesir etiketi
  geom_text(data = cells, 
            aes(x = (xmin + xmax) / 2, y = (ymin + ymax) / 2, label = label),
            size = 6, fontface = "bold", 
            color = ifelse(cells$i == 1 & cells$j == 1, "white", "#666666")) +
  # Renk skalası
  scale_fill_manual(
    name = "Açıklama",
    values = c("Sonuç (1/4)" = "#FF7043", "Kalan parçalar" = "#B0BEC5")
  ) +
  # Sol ve alt kenarda açıklamalar
  annotate("text", x = -0.15, y = 0.25, label = "1/2", 
           size = 6, fontface = "bold", color = "#1565C0") +
  annotate("segment", x = -0.05, xend = -0.05, y = 0, yend = 0.5,
           linewidth = 3, color = "#1565C0") +
  annotate("text", x = 0.25, y = -0.1, label = "1/2", 
           size = 6, fontface = "bold", color = "#C62828") +
  annotate("segment", x = 0, xend = 0.5, y = -0.02, yend = -0.02,
           linewidth = 3, color = "#C62828") +
  # İşlem açıklaması
  annotate("text", x = 0.5, y = 1.15, 
           label = "Çarpma: 1/2 × 1/2 = 1/4", 
           size = 5.5, fontface = "bold", color = "#333333") +
  annotate("text", x = 0.5, y = 1.0, 
           label = "(Yarının yarısı = çeyrek)", 
           size = 4, color = "#666666") +
  # Tema
  coord_fixed(xlim = c(-0.25, 1.05), ylim = c(-0.2, 1.25)) +
  theme_void() +
  theme(
    legend.position = "right",
    legend.title = element_text(face = "bold"),
    plot.margin = margin(20, 15, 15, 25)
  )

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 7, height = 5)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
