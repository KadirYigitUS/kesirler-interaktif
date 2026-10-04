# Kesirlerle Çıkarma İşlemi Gösterimi
# Türkçe etiketler ve renk açıklamalı

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "subtraction_borrow_example.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# 5/5 - 2/5 = 3/5 gösterimi
rects <- data.frame(
  xmin = seq(0, 4) / 5,
  xmax = seq(1, 5) / 5,
  ymin = 0,
  ymax = 1,
  idx = 1:5
)

# Kırmızı: çıkarılan (2/5), yeşil: kalan (3/5)
rects$durum <- ifelse(rects$idx <= 2, "Çıkarılan", "Kalan")
rects$fill <- ifelse(rects$idx <= 2, "#EF5350", "#66BB6A")

# Kesir etiketleri
labels_df <- data.frame(
  x = (rects$xmin + rects$xmax) / 2,
  y = rep(0.5, 5),
  label = paste0("1/5")
)

p <- ggplot() +
  # Dikdörtgenler
  geom_rect(data = rects, 
            aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax, fill = durum), 
            color = "white", linewidth = 1.5) +
  # Her parçada etiket
  geom_text(data = labels_df, aes(x = x, y = y, label = label),
            size = 5, fontface = "bold", color = "white") +
  # Renk skalası
  scale_fill_manual(
    name = "Açıklama",
    values = c("Çıkarılan" = "#EF5350", "Kalan" = "#66BB6A"),
    labels = c("Çıkarılan (2/5)", "Kalan (3/5)")
  ) +
  # Alt açıklama
  annotate("text", x = 0.5, y = -0.25, 
           label = "İşlem: 5/5 − 2/5 = 3/5", 
           size = 5, fontface = "bold", color = "#333333") +
  annotate("text", x = 0.5, y = -0.45, 
           label = "(1 tam = 5/5 olarak yazılır)", 
           size = 4, color = "#666666") +
  # Tema
  labs(
    title = "Kesirlerle Çıkarma İşlemi",
    subtitle = "Bir bütünden parça çıkarma gösterimi"
  ) +
  coord_cartesian(xlim = c(-0.05, 1.05), ylim = c(-0.6, 1.1)) +
  theme_void() +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "#666666"),
    legend.position = "right",
    legend.title = element_text(face = "bold"),
    plot.margin = margin(15, 15, 15, 15)
  )

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 8, height = 4)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
