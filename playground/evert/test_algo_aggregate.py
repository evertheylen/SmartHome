
from datetime import datetime
from dateutil.relativedelta import relativedelta

#now = int(datetime.now().timestamp())
now = 1461798000
values = [(v, now + i*900) for (i, v) in enumerate([0,30,0,90,0,0,0,0,60])]
print("values", values)

#if len(values) == 0: return

# values = tuples of (value, time)
# Assume the values are ordered by time
# Step 0: get the possible value before the first value in our input
actual_start = values[0][1]
#r = RawSql("SELECT value FROM table_value WHERE time < %(start)s ORDER BY time DESC LIMIT 1",
#           {"start": actual_start})
#previous_val = (await r.raw(db)) or 0
previous_val = 0

# Step 1: Divide into hours
start_date = datetime.fromtimestamp(actual_start)
start_date = datetime(start_date.year, start_date.month, start_date.day, start_date.hour)
start = int(start_date.timestamp())
print("Start", start_date, start)

actual_end = values[-1][1]
end_date = datetime.fromtimestamp(actual_end)
if end_date.minute == end_date.second == 0:
    end_date = end_date + relativedelta(hours=1)
else:
    end_date = datetime(start_date.year, start_date.month, start_date.day, start_date.hour) + relativedelta(hours=1)
end = int(end_date.timestamp())
print("End", end_date, end)

current_index = 0
for current in range(start, end, 3600):
    # Step 2: Calculate area under curve, determine average
    hour_start = current
    hour_end = current + 3600
    print("\nAggregating hour from {} to {}".format(hour_start, hour_end))
    
    # Step 2a: Get all values that are of importance
    # First determine the first value
    if values[current_index][1] == hour_start:
        hour_values = [values[current_index]]
    else:
        hour_values = [(previous_val, hour_start)]
    
    # Then all the rest
    try:
        while values[current_index][1] < hour_end:
            hour_values.append(values[current_index])
            current_index += 1
    except IndexError:
        pass
    
    # Add an extra value for handiness
    hour_values.append((999999, hour_end))
    print("Hour values:",hour_values)
    
    # Step 2b: determine area's
    hour_sum = 0
    for i, value in enumerate(hour_values[:-1]):
        width = hour_values[i+1][1] - value[1]
        hour_sum += width * value[0]
        print("hour_sum is now", hour_sum)
    
    # Step 2c: Insert the HourValue!
    #hv = HourValue(value=hour_sum/60, time=hour_start, sensor=sensor.key)
    #await hv.insert(db)  # TODO performance?
    print("Adding hour with value", hour_sum/60)

