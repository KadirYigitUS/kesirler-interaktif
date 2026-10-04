# Alıştırma: Karışık Pizza Gösterimi
# Türkçe etiketler ve pizza dilimlerinde açıklama

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "exercise_pizza_mix.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# Pizza dilimleri: 1/2 sucuk, 1/4 mısır, 1/4 zeytin
parts <- data.frame(
  start = c(0, 0.5, 0.75), 
  end = c(0.5, 0.75, 1), 
  fill = c("#E53935", "#FFA726", "#66BB6A"),
  malzeme = c("Sucuk", "Mısır", "Zeytin"),
  kesir = c("1/2", "1/4", "1/4"),
  stringsAsFactors = FALSE
)

# Pasta grafiği için açı hesabı
theta <- function(start, end) seq(2 * pi * start, 2 * pi * end, length.out = 50)

# Polygon verileri
polys <- lapply(1:nrow(parts), function(i) {
  th <- theta(parts$start[i], parts$end[i])
  data.frame(
    x = c(0, cos(th)), 
    y = c(0, sin(th)), 
    group = i, 
    fill = parts$fill[i],
    malzeme = parts$malzeme[i]
  )
})
polydf <- do.call(rbind, polys)

# Etiket konumları (dilim ortası)
label_df <- data.frame(
  mid = (parts$start + parts$end) / 2,
  malzeme = parts$malzeme,
  kesir = parts$kesir,
  fill = parts$fill
)
label_df$x <- 0.5 * cos(2 * pi * label_df$mid)
label_df$y <- 0.5 * sin(2 * pi * label_df$mid)
label_df$label <- paste0(label_df$malzeme, "\n", label_df$kesir)

p <- ggplot() +
  # Pizza dilimleri
  geom_polygon(data = polydf, 
               aes(x = x, y = y, group = group, fill = malzeme), 
               color = "white", linewidth = 2) +
  # Dilim üstünde etiketler
  geom_label(data = label_df, 
             aes(x = x, y = y, label = label, fill = malzeme),
             color = "white", fontface = "bold", size = 4,
             label.padding = unit(0.3, "lines"),
             label.size = 0) +
  # Renk skalası
  scale_fill_manual(
    name = "Malzemeler",
    values = c("Sucuk" = "#E53935", "Mısır" = "#FFA726", "Zeytin" = "#66BB6A")
  ) +
  # Dış daire kenarlığı
  annotate("path",
           x = cos(seq(0, 2 * pi, length.out = 100)),
           y = sin(seq(0, 2 * pi, length.out = 100)),
           color = "#5D4037", linewidth = 3) +
  # Tema
  coord_fixed() +
  labs(
    title = "Alıştırma: Karışık Pizza",
    subtitle = "Her dilimin kesir değerini bul ve topla"
  ) +
  theme_void() +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "#666666"),
    legend.position = "right",
    legend.title = element_text(face = "bold"),
    plot.margin = margin(15, 15, 15, 15)
  )

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 7, height = 5)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
