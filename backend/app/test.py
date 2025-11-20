import pandas as pd
import random
from datetime import datetime, timedelta


# Function to generate random mobile number
def generate_mobile():
    return random.randint(7000000000, 9999999999)


# Function to generate random email
def generate_email():
    return f"user{random.randint(1, 99999)}@example.com"


# Function to generate multiple email addresses or mobile numbers based on dp_identifier type
def generate_dp_identifier():
    choice = random.choice([["email"], ["mobile"], ["email", "mobile"]])
    if "email" in choice:
        num_emails = random.randint(1, 3)  # Email count can vary between 1 and 3
        emails = [generate_email() for _ in range(num_emails)]
    else:
        emails = []

    if "mobile" in choice:
        num_mobiles = random.randint(1, 3)  # Mobile count can vary between 1 and 3
        mobiles = [generate_mobile() for _ in range(num_mobiles)]
    else:
        mobiles = []

    return choice, emails, mobiles


# Function to generate random system ID (SYS followed by 3-4 digit number)
def generate_dp_system_id():
    return f"SYS{random.randint(100, 9999)}"


# List of possible devices for dp_active_devices
active_devices = ["mobile", "tablet", "laptop", "desktop", "smartwatch"]


# Function to generate random date and time in the past month
def generate_random_datetime():
    start_date = datetime.now() - timedelta(days=30)  # Within last 30 days
    random_time = start_date + timedelta(
        seconds=random.randint(0, 2592000)
    )  # Random time within the range
    return random_time.strftime("%Y-%m-%d %H:%M:%S")


# List of random first names
first_names = [
    "Rohit",
    "Priya",
    "Ananya",
    "Amit",
    "Suresh",
    "Neha",
    "Vikas",
    "Rani",
    "Raj",
    "Sunil",
    # additional names
    "Manish",
    "Kiran",
    "Deepika",
    "Rohini",
    "Sanjay",
    "Megha",
    "Rahul",
    "Pooja",
    "Arjun",
    "Sneha",
    "Karan",
    "Mona",
    "Tarun",
    "Alka",
    "Gautam",
    # more names
    "Bhavesh",
    "Charu",
    "Devika",
    "Esha",
    "Farhan",
    "Gauri",
    "Harish",
    "Isha",
    "Jay",
    "Kavita",
]

# dp_persona values
dp_persona_values = [
    "680758db05f58470d4e8b794",
    "6807752da5682879fb910952",
    "680781baa5682879fb91095b",
    "68078639a5682879fb91095f",
    "680789d7537287d432acd6c9",
    "6807910d537287d432acd701",
    "6807912d01b24e05193b45ed",
    "6807965701b24e05193b45f7",
    "6808751aebc2bc6832e586c5",
    "68089065ebc2bc6832e586cf",
    "680c82b4ebc2bc6832e5884d",
    "680c91e7ebc2bc6832e5884f",
    "680f392f699ed962b100d360",
    "680f3aca699ed962b100d38e",
    "680f50d2699ed962b100d393",
    "6815b36e77d60f2fbed34d6b",
    "6815b844b500fae517b2b5d8",
    "6815b8f2b500fae517b2b5d9",
    "6815b999b500fae517b2b5da",
    "6815bec5b500fae517b2b5dc",
]

dp_tags_values = ["new", "legacy", "old", "active", "inactive"]

# Generating the final data
data_final = []
languages = [
    "Hindi",
    "Bengali",
    "Telugu",
    "Marathi",
    "Tamil",
    "Urdu",
    "Gujarati",
    "Punjabi",
    "Malayalam",
    "Kannada",
    "English",
]

for _ in range(10000):
    dp_persona = random.sample(dp_persona_values, random.randint(1, 3))
    dp_country = "India"
    dp_state = random.choice(
        [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
            "Delhi",
        ]
    )

    dp_identifier_type, dp_email, dp_mobile = generate_dp_identifier()
    dp_identifier = dp_identifier_type
    dp_tags = random.sample(dp_tags_values, random.randint(1, 4))
    dp_system_id = generate_dp_system_id()
    dp_active_devices_value = random.sample(active_devices, random.randint(1, 3))
    is_active = random.choice([True, False])
    is_legacy = random.choice([True, False])
    created_at_df = generate_random_datetime()
    last_activity = generate_random_datetime()

    # New dp_first_name field (Random selection from first names)
    dp_first_name = random.choice(first_names)

    # Creating the row
    row = {
        "dp_first_name": dp_first_name,
        "dp_persona": dp_persona,
        "dp_country": dp_country,
        "dp_state": dp_state,
        "dp_identifiers": dp_identifier,
        "dp_email": dp_email,
        "dp_mobile": dp_mobile,
        "dp_tags": dp_tags,
        "dp_system_id": dp_system_id,
        "dp_active_devices": dp_active_devices_value,
        "is_active": is_active,
        "is_legacy": is_legacy,
        "created_at_df": created_at_df,
        "last_activity": last_activity,
    }
    data_final.append(row)

# Create DataFrame
df_final = pd.DataFrame(data_final)

# Add dp_preferred_language column with random language selection
df_final["dp_preferred_lang"] = [random.choice(languages) for _ in range(len(df_final))]

# Reorder the columns as requested
df_final_reordered = df_final[
    [
        "dp_system_id",
        "dp_identifiers",
        "dp_email",
        "dp_mobile",
        "dp_preferred_lang",
        "dp_country",
        "dp_state",
        "dp_first_name",  # Added dp_first_name here
        "dp_persona",
        "dp_tags",
        "dp_active_devices",
        "is_active",
        "is_legacy",
        "created_at_df",
        "last_activity",
    ]
]

# Convert 'created_at_df' and 'last_activity' to the required datetime format
df_final_reordered["created_at_df"] = pd.to_datetime(
    df_final_reordered["created_at_df"]
).dt.strftime("%Y-%m-%dT%H:%M:%S.%f")
df_final_reordered["last_activity"] = pd.to_datetime(
    df_final_reordered["last_activity"]
).dt.strftime("%Y-%m-%dT%H:%M:%S.%f")

# Save the final CSV with updated datetime format
output_file_final = "app/10000_data_principal.csv"
df_final_reordered.to_csv(output_file_final, index=False)

output_file_final
