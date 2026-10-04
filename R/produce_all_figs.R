# Produce all figures: çağırılan scriptleri sırayla çalıştırır
# Güvenli şekilde bu dosyanın bulunduğu dizini bul ve oraya geç
args_all <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args_all, value = TRUE)
if (length(file_arg)) {
  thisfile <- normalizePath(sub("^--file=", "", file_arg[1]))
} else {
  thisfile <- tryCatch(normalizePath(sys.frames()[[1]]$ofile), error = function(e) NA)
  if (is.na(thisfile)) thisfile <- normalizePath(".")
}
script_dir <- dirname(thisfile)
setwd(script_dir)

# Listeleyeceğimiz scriptler
scripts <- c(
  "fig_pizza.R", "fig_numberline.R", "fig_rect_slices.R", "fig_xy_examples.R",
  "fig_terms.R", "fig_subtraction.R", "fig_multiplication.R", "fig_division.R", "fig_exercises.R"
)
for (s in scripts) {
  cat("Running:", s, "\n")
  path <- file.path(script_dir, s)
  if (!file.exists(path)) {
    cat("Missing:", path, " — skipping\n")
    next
  }
  tryCatch({
    source(path)
  }, error = function(e) {
    cat("Error while running", s, ":", conditionMessage(e), "\n")
  })
}

cat("All done. Figures are in ../figs/\n")
