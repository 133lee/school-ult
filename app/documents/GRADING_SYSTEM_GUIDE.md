# Grading System Configuration Guide

## Overview

The school management system now supports **three distinct grading configurations** for different educational levels, each with its own grading scale and assessment weights.

---

## 1. Primary Level (Grades 1-7)

### Grading Scale:
| Grade | Description | Percentage Range |
|-------|-------------|------------------|
| **E** | Excellent | 80-100% |
| **VG** | Very Good | 70-79% |
| **G** | Good | 60-69% |
| **S** | Satisfactory | 50-59% |
| **W** | Weak | 0-49% |

### Assessment Weights:
| Assessment Type | Weight | Notes |
|----------------|--------|-------|
| CAT 1 | 15% | Continuous Assessment Test 1 |
| CAT 2 | 15% | Continuous Assessment Test 2 |
| End of Term | 70% | Final examination |
| **TOTAL** | **100%** | |

### Characteristics:
- **Simpler grading system** with 5 letter grades
- **Higher emphasis on final exam** (70%) to reduce pressure from frequent testing
- **Two CATs** instead of three, more age-appropriate
- **Pass mark**: Typically 50% (Grade S)

---

## 2. Junior Secondary (Grades 8-9)

### Grading Scale:
| Grade | Description | Percentage Range |
|-------|-------------|------------------|
| **A** | Distinction | 75-100% |
| **B** | Credit | 65-74% |
| **C** | Pass | 50-64% |
| **D** | Weak Pass | 40-49% |
| **E** | Fail | 0-39% |

### Assessment Weights:
| Assessment Type | Weight | Notes |
|----------------|--------|-------|
| CAT 1 | 10% | First continuous assessment |
| CAT 2 | 10% | Second continuous assessment |
| Mid-Term | 20% | Mid-term examination |
| End of Term | 60% | Final examination |
| **TOTAL** | **100%** | |

### Characteristics:
- **Transition grading system** preparing students for senior level
- **Lower distinction threshold** (75% vs 80%) recognizes the challenge of transition
- **Four assessment components** introducing mid-term exams
- **Pass mark**: 50% (Grade C)
- **Weak pass category** (D) signals students need improvement but aren't failing

---

## 3. Senior Secondary (Grades 10-12 / Form 1-4)

### Grading Scale:
| Grade | Description | Percentage Range |
|-------|-------------|------------------|
| **A** | Distinction | 80-100% |
| **B** | Merit | 70-79% |
| **C** | Credit | 60-69% |
| **D** | Pass | 50-59% |
| **E** | Weak | 40-49% |
| **F** | Fail | 0-39% |

### Assessment Weights:
| Assessment Type | Weight | Notes |
|----------------|--------|-------|
| CAT 1 | 10% | First continuous assessment |
| CAT 2 | 10% | Second continuous assessment |
| CAT 3 | 10% | Third continuous assessment |
| Mid-Term | 20% | Mid-term examination |
| End of Term | 50% | Final examination |
| **TOTAL** | **100%** | |

### Characteristics:
- **Most comprehensive grading** with 6 letter grades
- **Standard distinction threshold** (80%) preparing for university
- **Five assessment components** including 3 CATs
- **More balanced weighting** (50% final vs 70% in primary)
- **Pass mark**: 50% (Grade D)
- **Aligns with Form 1-4 naming** in some educational systems

---

## How the System Works

### For Teachers:
1. **Automatic Configuration**: When creating an assessment, the system automatically applies the correct grading scale based on the class being taught
2. **Grade Display**: Marks are automatically converted to letter grades according to the appropriate scale
3. **Clear Guidelines**: Teachers see the exact weights and ranges for their grade level

### For Admin:
1. **Review Assessments**: Can see which grading scale applies to each submitted assessment
2. **Configure Scales**: Can modify percentage ranges and weights per school policy
3. **Consistent Standards**: Ensures all teachers in a grade level use the same criteria

### For Students/Parents:
1. **Clear Expectations**: Know exactly what percentage ranges correspond to each grade
2. **Transparent Weighting**: Understand how much each assessment contributes to final grade
3. **Fair Comparison**: Grades are calculated consistently across all classes in the same level

---

## Implementation Details

### Database Schema Suggestion:
```typescript
interface GradingConfiguration {
  id: string;
  name: string; // "Primary", "Junior Secondary", "Senior Secondary"
  gradeRange: string; // "1-7", "8-9", "10-12"
  grades: {
    letter: string; // "A", "B", "C", etc.
    description: string; // "Distinction", "Merit", etc.
    minPercent: number;
    maxPercent: number;
  }[];
  assessmentWeights: {
    type: string; // "CAT1", "CAT2", "MID", "EOT"
    weight: number; // Percentage
  }[];
  passPercentage: number; // Minimum to pass
}
```

### Grade Calculation Example:

**Senior Secondary Student (Grade 10):**
```
CAT 1: 85/100 × 10% = 8.5%
CAT 2: 78/100 × 10% = 7.8%
CAT 3: 82/100 × 10% = 8.2%
Mid-Term: 75/100 × 20% = 15.0%
End of Term: 88/100 × 50% = 44.0%
─────────────────────────────
Total: 83.5% → Grade A (Distinction)
```

**Primary Level Student (Grade 5):**
```
CAT 1: 72/100 × 15% = 10.8%
CAT 2: 68/100 × 15% = 10.2%
End of Term: 75/100 × 70% = 52.5%
─────────────────────────────
Total: 73.5% → Grade VG (Very Good)
```

---

## Customization Options

Schools can adjust:
1. **Percentage Ranges**: Modify the min/max for each grade
2. **Assessment Weights**: Change the contribution of each test type
3. **Number of CATs**: Add or remove continuous assessments
4. **Grade Letters**: Use numbers (1-5) instead of letters if preferred
5. **Pass Marks**: Set different passing percentages per level

---

## Best Practices

### For Primary Level (1-7):
- Focus on formative assessment through the two CATs
- Use End of Term as summative assessment
- Emphasize learning progress over competition
- Consider narrative reports alongside grades

### For Junior Secondary (8-9):
- Introduce formal mid-term exams gradually
- Use CATs for topic-specific assessment
- Monitor students who score D (40-49%) closely
- Prepare students for senior-level rigor

### For Senior Secondary (10-12):
- Distribute assessment throughout term (3 CATs)
- Use mid-term as preparation for finals
- Maintain high standards for university preparation
- Track performance trends across all assessments

---

## Migration Guide

If your school currently uses a different system:

1. **Map Existing Grades**: Convert current letter grades to new percentages
2. **Communicate Changes**: Inform parents and students of new criteria
3. **Transition Period**: Consider allowing one term for adjustment
4. **Historical Data**: Keep records of old grading system for transcripts
5. **Training**: Ensure all teachers understand the new configurations

---

## Visual Indicators

The system uses **color coding** for quick recognition:
- 🟢 **Green**: Top grades (E/A depending on level)
- 🔵 **Blue**: Good grades (VG/B)
- 🟡 **Yellow**: Passing grades (G/C)
- 🟠 **Orange**: Weak/borderline (S/D)
- 🔴 **Red**: Failing grades (W/E/F)

---

## Compliance & Standards

This configuration supports:
- **Cambridge International**: IGCSE grading patterns
- **National Curricula**: Adaptable to various national standards
- **IB Programmes**: Can align with IB grade boundaries
- **Local Requirements**: Fully customizable per jurisdiction

---

## Support & Documentation

For questions about:
- **Grading Policies**: Consult with academic administration
- **Technical Setup**: Refer to system administrator
- **Custom Configurations**: Contact support team
- **Parent Inquiries**: Use the parent communication module

---

**Last Updated**: 2025-10-20
**Version**: 1.0
**Status**: Active Configuration
