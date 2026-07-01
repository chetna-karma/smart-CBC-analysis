class CBCAnalyzer:
    # Normal reference ranges
    RANGES = {
        'hemoglobin': {'min': 12.0, 'max': 16.0},
        'wbc': {'min': 4000.0, 'max': 11000.0},
        'platelets': {'min': 150000.0, 'max': 450000.0},
        'rbc': {'min': 4.5, 'max': 5.9},
        'mcv': {'min': 80.0, 'max': 100.0}
    }

    @staticmethod
    def analyze(hemoglobin, wbc, platelets, rbc, mcv):
        """
        Analyze the five CBC parameters and return details, risk score, health score, category, and summary.
        """
        results = {}
        abnormal_count = 0
        high_risk_count = 0
        medium_risk_count = 0

        parameters = {
            'hemoglobin': hemoglobin,
            'wbc': wbc,
            'platelets': platelets,
            'rbc': rbc,
            'mcv': mcv
        }

        for param, val in parameters.items():
            ref = CBCAnalyzer.RANGES[param]
            status = 'Normal'
            risk_level = 'Low'
            explanation = ''
            possible_cause = ''
            recommendation = ''

            if val < ref['min']:
                status = 'Low'
                abnormal_count += 1
                
                if param == 'hemoglobin':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "Low hemoglobin indicates anemia, meaning your body does not have enough red blood cells or they aren't working properly to carry oxygen to your tissues. Can cause fatigue, weakness, or shortness of breath."
                    possible_cause = "Iron deficiency anemia, vitamin B12 or folate deficiency, chronic bleeding, kidney disease, or thalassemia."
                    recommendation = "Increase dietary iron intake (spinach, red meat, beans), consume Vitamin C to boost iron absorption, and consult a doctor for possible iron supplements."
                elif param == 'wbc':
                    risk_level = 'High'
                    high_risk_count += 1
                    explanation = "Low WBC count (Leukopenia) weakens the immune system, making it harder for the body to fight off infections. Can be caused by viral infections, autoimmune conditions, or bone marrow issues."
                    possible_cause = "Viral infections, autoimmune disorders, bone marrow suppression, nutritional deficiencies, or specific medications."
                    recommendation = "Avoid contact with sick people, practice strict hand hygiene, eat fully cooked foods, and see a doctor to investigate further."
                elif param == 'platelets':
                    risk_level = 'High'
                    high_risk_count += 1
                    explanation = "Low platelet count (Thrombocytopenia) increases the risk of bruising and bleeding, as platelets are essential for blood clotting. Can be caused by viral infections, vitamin deficiencies, or autoimmune disorders."
                    possible_cause = "Viral infections (like dengue), autoimmune disorders, leukemia, vitamin B12 or folate deficiency, liver disease, or medications."
                    recommendation = "Avoid contact sports or activities with high risk of injury, use a soft toothbrush, avoid blood-thinning medications like aspirin unless prescribed, and see a physician immediately."
                elif param == 'rbc':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "Low RBC count reduces the oxygen-carrying capacity of the blood, which can lead to fatigue, dizziness, and pallor. Often linked to anemia or nutritional deficiencies."
                    possible_cause = "Blood loss, iron or vitamin B12/folate deficiency, bone marrow failure, erythropoietin deficiency, or pregnancy."
                    recommendation = "Eat iron-rich foods, ensure adequate Vitamin B12 and folate intake, and discuss with a doctor."
                elif param == 'mcv':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "Low MCV indicates that your red blood cells are smaller than normal (microcytosis), which is commonly caused by iron deficiency anemia or thalassemia."
                    possible_cause = "Iron deficiency anemia, chronic disease anemia, lead poisoning, or thalassemia trait."
                    recommendation = "Focus on iron-rich foods, consult a healthcare provider for blood tests like ferritin, and avoid drinking tea/coffee with meals (inhibits iron absorption)."

            elif val > ref['max']:
                status = 'High'
                abnormal_count += 1
                
                if param == 'hemoglobin':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "High hemoglobin can be caused by dehydration, smoking, living at high altitudes, or chronic lung diseases. It means the blood is thicker than normal."
                    possible_cause = "Dehydration, chronic lung disease (COPD), smoking, living at high altitude, or polycythemia vera."
                    recommendation = "Stay well hydrated, avoid smoking, and consult a healthcare provider to determine the root cause."
                elif param == 'wbc':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "High WBC count (Leukocytosis) typically indicates that the body is fighting an active infection, inflammation, or experiencing high physical/emotional stress."
                    possible_cause = "Active bacterial or viral infection, tissue inflammation, high physical stress, leukemia, or allergic reactions."
                    recommendation = "Monitor for symptoms like fever or pain, get adequate rest, stay hydrated, and consult a physician if symptoms persist."
                elif param == 'platelets':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "High platelet count (Thrombocytosis) can increase the risk of blood clots. It is often a reaction to infection, inflammation, or iron deficiency."
                    possible_cause = "Acute inflammation, chronic infection, iron deficiency anemia, splenectomy, or primary thrombocythemia."
                    recommendation = "Keep hydrated, maintain regular physical activity to support blood flow, and consult a doctor for diagnostic evaluation."
                elif param == 'rbc':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "High RBC count (Erythrocytosis) can thicken the blood, reducing blood flow speed. It can be caused by dehydration, low oxygen levels (hypoxia), or sleep apnea."
                    possible_cause = "Chronic low oxygen levels (hypoxia), sleep apnea, smoking, dehydration, or renal cell tumor."
                    recommendation = "Increase water consumption, check for sleep apnea, and consult a physician to check for underlying conditions."
                elif param == 'mcv':
                    risk_level = 'Medium'
                    medium_risk_count += 1
                    explanation = "High MCV means red blood cells are larger than normal (macrocytosis), usually due to vitamin B12 or folate deficiency, thyroid issues, or alcohol consumption."
                    possible_cause = "Vitamin B12 or folate deficiency, heavy alcohol usage, liver dysfunction, hypothyroidism, or bone marrow dysplasia."
                    recommendation = "Increase intake of folate (leafy greens) and Vitamin B12 (meat, dairy, or supplements), and limit alcohol consumption."

            else:
                status = 'Normal'
                risk_level = 'Low'
                if param == 'hemoglobin':
                    explanation = "Hemoglobin levels are in the healthy range, indicating efficient oxygen transport throughout the body."
                    possible_cause = "Healthy oxygen capacity, balanced nutrition, and adequate hydration."
                    recommendation = "Maintain a balanced diet rich in iron and vitamins to support healthy blood."
                elif param == 'wbc':
                    explanation = "White blood cell counts are normal, indicating a healthy, active immune system ready to defend against pathogens."
                    possible_cause = "Healthy immune function, active bone marrow, and no acute infection/inflammation."
                    recommendation = "Support immune health with regular exercise, proper sleep, and a nutrient-dense diet."
                elif param == 'platelets':
                    explanation = "Platelet levels are healthy, indicating normal blood clotting functionality."
                    possible_cause = "Proper clotting function and standard cardiovascular protection."
                    recommendation = "Maintain a healthy lifestyle to support proper clotting function."
                elif param == 'rbc':
                    explanation = "RBC count is within the standard range, supporting healthy oxygenation of tissues."
                    possible_cause = "Optimal red blood cell production and proper systemic oxygenation."
                    recommendation = "Continue eating a balanced diet with folate, iron, and vitamin B12."
                elif param == 'mcv':
                    explanation = "MCV is normal, indicating red blood cells are of standard size."
                    possible_cause = "Red blood cells are of standard, healthy size and volume."
                    recommendation = "Continue general healthy habits to maintain blood cell morphology."

            results[param] = {
                'value': val,
                'min_ref': ref['min'],
                'max_ref': ref['max'],
                'status': status,
                'risk_level': risk_level,
                'explanation': explanation,
                'possible_cause': possible_cause,
                'recommendation': recommendation
            }

        # Calculate overall risk score (0-100)
        risk_score = 0
        risk_score += high_risk_count * 30
        risk_score += medium_risk_count * 15

        # Critical severity checks
        if platelets < 80000 or platelets > 700000:
            risk_score += 15
        if wbc < 2500 or wbc > 20000:
            risk_score += 15
        if hemoglobin < 9.0 or hemoglobin > 19.0:
            risk_score += 15

        # Cap score at 100
        risk_score = min(100, risk_score)

        # Health Score = 100 - risk_score
        health_score = 100 - risk_score
        
        # Determine category:
        # 90-100: Excellent
        # 75-89: Good
        # 50-74: Moderate
        # 0-49: High Risk
        if health_score >= 90:
            health_category = "Excellent"
        elif health_score >= 75:
            health_category = "Good"
        elif health_score >= 50:
            health_category = "Moderate"
        else:
            health_category = "High Risk"

        # Build overall health summary and suggestions
        summary_paragraphs = []
        recommendation_paragraphs = []

        if abnormal_count == 0:
            summary_paragraphs.append(f"Your blood report parameters are within normal ranges. Overall Health Score: {health_score} ({health_category}). This indicates a well-balanced profile with good oxygen transport capacity, a stable immune system, and normal clotting capabilities.")
            recommendation_paragraphs.append("Continue maintaining a balanced diet, regular exercise, and adequate hydration. Schedule periodic checkups to monitor your baseline trends.")
        else:
            summary_paragraphs.append(f"Your CBC report contains {abnormal_count} abnormal parameter(s). Overall Health Score: {health_score} ({health_category}).")
            
            # Group anomalies
            anomalies = []
            for p, r in results.items():
                if r['status'] != 'Normal':
                    anomalies.append(f"{p.upper()} is {r['status']} ({r['value']} vs normal range {r['min_ref']}-{r['max_ref']})")
            
            summary_paragraphs.append("The detected abnormalities include: " + ", ".join(anomalies) + ".")
            
            if high_risk_count > 0 or health_score < 50:
                summary_paragraphs.append("ATTENTION: Critical deviations were observed. This indicates potential vulnerability to infections, bleeding disorders, or other critical systemic issues.")
                recommendation_paragraphs.append("We strongly recommend consulting a healthcare professional immediately to evaluate these critical values.")
            else:
                summary_paragraphs.append("Moderate deviations are present, suggesting potential mild anemia, minor nutritional deficiencies, or mild dehydration.")
                recommendation_paragraphs.append("We advise discussing these results with your primary care physician to outline dietary improvements or potential blood tests (e.g. Ferritin, Vitamin B12, Folate).")

            # Collect parameter-specific recommendations
            for p, r in results.items():
                if r['status'] != 'Normal':
                    recommendation_paragraphs.append(f"For {p.upper()}: {r['recommendation']}")

        summary = "\n\n".join(summary_paragraphs)
        recommendations = "\n\n".join(recommendation_paragraphs)

        return {
            'parameters': results,
            'risk_score': risk_score,
            'health_score': health_score,
            'health_category': health_category,
            'summary': summary,
            'recommendations': recommendations
        }
