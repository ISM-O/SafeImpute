import math

def commpare_to_vector(vector_from_database, vector_from_frontend)-> bool:

    if len(vector_from_database)!= len(vector_from_frontend):
        return False

    distance = math.sqrt(sum((a - b) ** 2 for a, b in zip(vector_from_database, vector_from_frontend)))  

    if distance < 0.5:
        return True
    
    else :
        return False