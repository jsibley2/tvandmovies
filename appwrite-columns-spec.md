# Appwrite tv_and_movies Table Column Specification

**Database**: tvandmovies (ID: 6912370f00317ce52077)
**Table**: tv_and_movies

## Columns to Add

### 1. String Columns

#### title
- **Type**: String
- **Size**: 500 characters
- **Required**: Yes
- **Description**: User's input TV show/movie title

#### officialTitle
- **Type**: String
- **Size**: 500 characters
- **Required**: No
- **Description**: Official title from WatchMode API

#### originalLanguage
- **Type**: String
- **Size**: 10 characters
- **Required**: No
- **Description**: ISO language code (e.g., "en", "es", "fr")

#### media_type
- **Type**: String
- **Size**: 20 characters
- **Required**: No
- **Description**: Type of media (tv_series or movie)

---

### 2. Integer Columns

#### latestSeason
- **Type**: Integer
- **Required**: No
- **Min**: 1
- **Max**: 100
- **Description**: Latest season number available

#### episodeCount
- **Type**: Integer
- **Required**: No
- **Min**: 0
- **Max**: 10000
- **Description**: Number of episodes in the season

#### criticScore
- **Type**: Integer
- **Required**: No
- **Min**: 0
- **Max**: 100
- **Description**: Critic rating percentage (0-100)

#### season
- **Type**: Integer
- **Required**: No
- **Min**: 1
- **Max**: 100
- **Description**: Season number currently watching

---

### 3. Float Column

#### userRating
- **Type**: Float (Decimal)
- **Required**: No
- **Min**: 0
- **Max**: 10
- **Description**: User rating on 0-10 scale

---

### 4. DateTime Columns

#### seasonStartDate
- **Type**: DateTime
- **Required**: No
- **Description**: First air date of the season

#### seasonEndDate
- **Type**: DateTime
- **Required**: No
- **Description**: Last air date of the season

---

### 5. String Array Columns (for JSON data)

#### streamingSources
- **Type**: String
- **Size**: 10000 characters
- **Required**: No
- **Array**: Yes
- **Description**: Array of streaming service data (JSON strings)

#### genreNames
- **Type**: String
- **Size**: 1000 characters
- **Required**: No
- **Array**: Yes
- **Description**: Array of genre names

---

### 6. Boolean Column

#### watched
- **Type**: Boolean
- **Required**: No
- **Default**: false
- **Description**: Whether the show/movie has been watched

---

## Total Columns: 14

## Steps to Add in Appwrite Console

1. Go to https://cloud.appwrite.io/console
2. Navigate to **Databases** → **tvandmovies** → **tv_and_movies** table
3. Click **"Add Column"** for each column above
4. Follow the specifications exactly as listed
5. Save each column after creation

## Notes

- The `streamingSources` and `genreNames` columns store JSON data as string arrays
- All optional fields should have **Required** set to **No**
- The `title` field is the only required column
- Array columns (`streamingSources`, `genreNames`) must have the **Array** checkbox enabled
